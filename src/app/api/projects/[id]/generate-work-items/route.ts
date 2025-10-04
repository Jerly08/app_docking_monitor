import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/projects/[id]/generate-work-items - Generate work items from templates
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const { packages, templateIds } = body
    let templates = []

    if (packages && Array.isArray(packages)) {
      // Generate from packages
      templates = await prisma.workItemTemplate.findMany({
        where: {
          packageLetter: { in: packages },
          isActive: true
        },
        include: {
          children: {
            include: {
              children: {
                include: {
                  children: true
                }
              }
            }
          }
        },
        orderBy: [
          { packageLetter: 'asc' },
          { displayOrder: 'asc' }
        ]
      })
    } else if (templateIds && Array.isArray(templateIds)) {
      // Generate from specific templates
      templates = await prisma.workItemTemplate.findMany({
        where: {
          id: { in: templateIds },
          isActive: true
        },
        include: {
          children: {
            include: {
              children: {
                include: {
                  children: true
                }
              }
            }
          }
        },
        orderBy: [
          { packageLetter: 'asc' },
          { displayOrder: 'asc' }
        ]
      })
    } else {
      return NextResponse.json(
        { error: 'Either packages or templateIds must be provided' },
        { status: 400 }
      )
    }

    if (templates.length === 0) {
      return NextResponse.json(
        { error: 'No templates found for the specified criteria' },
        { status: 404 }
      )
    }

    // Generate work items from templates
    const createdWorkItems = []
    const templateMap = new Map() // To track template ID to work item ID mapping

    // Function to create work items recursively
    const createWorkItemFromTemplate = async (template: any, parentWorkItemId?: string) => {
      // Generate work item ID
      const workItemId = `${project.vesselName.replace(/[^a-zA-Z0-9]/g, '')}-${template.packageLetter}${template.itemNumber || ''}-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`
        .toUpperCase()

      const workItemData = {
        id: workItemId,
        title: template.title,
        description: template.description,
        completion: 0,
        package: template.packageLetter,
        durationDays: 1, // Default duration, can be customized
        resourceNames: '',
        isMilestone: false,
        projectId: id,
        templateId: template.id,
        parentId: parentWorkItemId,
        volume: template.volume ? parseFloat(template.volume.toString()) : undefined,
        unit: template.unit,
        status: 'PLANNED'
      }

      const workItem = await prisma.workItem.create({
        data: workItemData,
        include: {
          template: true,
          parent: {
            select: {
              id: true,
              title: true
            }
          }
        }
      })

      createdWorkItems.push(workItem)
      templateMap.set(template.id, workItem.id)

      // Create child work items recursively
      if (template.children && template.children.length > 0) {
        for (const childTemplate of template.children) {
          await createWorkItemFromTemplate(childTemplate, workItem.id)
        }
      }

      return workItem
    }

    // Create work items from root templates
    const rootTemplates = templates.filter(t => !t.parentTemplateId)
    
    for (const template of rootTemplates) {
      await createWorkItemFromTemplate(template)
    }

    return NextResponse.json({
      message: `Successfully generated ${createdWorkItems.length} work items from templates`,
      created: createdWorkItems.length,
      workItems: createdWorkItems,
      project: {
        id: project.id,
        name: project.projectName
      },
      templates: {
        processed: templates.length,
        packages: packages || [],
        templateIds: templateIds || []
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