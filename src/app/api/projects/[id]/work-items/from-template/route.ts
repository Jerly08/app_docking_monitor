import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/projects/[id]/work-items/from-template - Generate work items from templates
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { packageLetters, selectedTemplateIds, options = {} } = body

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id },
      select: { 
        id: true, 
        projectName: true, 
        vesselName: true,
        status: true,
        vesselSpecs: true
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    if (project.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot add work items to completed project' },
        { status: 409 }
      )
    }

    let templatesToProcess = []

    // Get templates based on input type
    if (packageLetters && Array.isArray(packageLetters)) {
      // Generate from full packages
      templatesToProcess = await prisma.workItemTemplate.findMany({
        where: {
          packageLetter: { in: packageLetters },
          level: { not: 'PACKAGE' }, // Exclude package-level templates
          isActive: true
        },
        include: {
          parent: true,
          children: true
        },
        orderBy: [
          { packageLetter: 'asc' },
          { displayOrder: 'asc' }
        ]
      })
    } else if (selectedTemplateIds && Array.isArray(selectedTemplateIds)) {
      // Generate from specific template IDs
      templatesToProcess = await prisma.workItemTemplate.findMany({
        where: {
          id: { in: selectedTemplateIds },
          isActive: true
        },
        include: {
          parent: true,
          children: true
        },
        orderBy: [
          { packageLetter: 'asc' },
          { displayOrder: 'asc' }
        ]
      })
    } else {
      return NextResponse.json(
        { error: 'Either packageLetters or selectedTemplateIds must be provided' },
        { status: 400 }
      )
    }

    if (templatesToProcess.length === 0) {
      return NextResponse.json(
        { error: 'No valid templates found' },
        { status: 404 }
      )
    }

    // Generate work items from templates
    const createdWorkItems = []
    const templateToWorkItemMap = new Map() // To track parent-child relationships

    // Process templates in order (parents first, then children)
    for (const template of templatesToProcess) {
      try {
        // Generate work item ID
        const workItemId = `WI-${id}-${template.packageLetter}${template.itemNumber || ''}${template.subLetter || ''}-${Date.now()}`

        // Determine parent ID for hierarchical structure
        let parentWorkItemId = null
        if (template.parentTemplateId && templateToWorkItemMap.has(template.parentTemplateId)) {
          parentWorkItemId = templateToWorkItemMap.get(template.parentTemplateId)
        }

        // Create work item data
        const workItemData = {
          id: workItemId,
          title: template.title,
          description: template.description || null,
          volume: template.volume ? Number(template.volume) : null,
          unit: template.unit || null,
          completion: 0, // Start with 0% completion
          package: template.packageName,
          templateId: template.id,
          projectId: id,
          parentId: parentWorkItemId,
          resourceNames: options.defaultResourceNames || '',
          status: options.defaultStatus || null,
          // Set dates based on project dates and template
          startDate: options.useProjectDates ? project.vesselSpecs?.startDate || null : null,
          finishDate: options.useProjectDates ? project.vesselSpecs?.endDate || null : null,
          durationDays: options.defaultDuration || 1
        }

        // Create work item
        const createdWorkItem = await prisma.workItem.create({
          data: workItemData,
          include: {
            template: {
              select: {
                id: true,
                packageLetter: true,
                packageName: true,
                level: true,
                itemNumber: true,
                subLetter: true
              }
            },
            parent: {
              select: {
                id: true,
                title: true
              }
            },
            project: {
              select: {
                id: true,
                projectName: true
              }
            }
          }
        })

        createdWorkItems.push(createdWorkItem)
        templateToWorkItemMap.set(template.id, workItemId)

        // Add small delay to ensure unique timestamps
        await new Promise(resolve => setTimeout(resolve, 10))
        
      } catch (itemError) {
        console.error(`Error creating work item from template ${template.id}:`, itemError)
        // Continue with other templates instead of failing entirely
      }
    }

    // Group created work items by package for response
    const workItemsByPackage = createdWorkItems.reduce((acc: any, item) => {
      const packageName = item.package || 'Uncategorized'
      if (!acc[packageName]) {
        acc[packageName] = []
      }
      acc[packageName].push(item)
      return acc
    }, {})

    // Generate summary statistics
    const stats = {
      totalCreated: createdWorkItems.length,
      packagesGenerated: Object.keys(workItemsByPackage).length,
      parentItems: createdWorkItems.filter(item => !item.parentId).length,
      childItems: createdWorkItems.filter(item => item.parentId).length,
      packageBreakdown: Object.keys(workItemsByPackage).map(packageName => ({
        package: packageName,
        count: workItemsByPackage[packageName].length,
        items: workItemsByPackage[packageName].map((item: any) => ({
          id: item.id,
          title: item.title,
          level: item.template?.level,
          hasParent: !!item.parentId
        }))
      }))
    }

    return NextResponse.json({
      message: `Successfully generated ${createdWorkItems.length} work items from templates`,
      project: {
        id: project.id,
        name: project.projectName,
        vessel: project.vesselName
      },
      workItems: createdWorkItems,
      workItemsByPackage,
      stats,
      templates: {
        processed: templatesToProcess.length,
        packages: [...new Set(templatesToProcess.map(t => t.packageLetter))]
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error generating work items from templates:', error)
    return NextResponse.json(
      { error: 'Failed to generate work items from templates' },
      { status: 500 }
    )
  }
}