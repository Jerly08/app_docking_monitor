import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/work-item-templates - List templates with filtering options
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const packageLetter = searchParams.get('package')
    const level = searchParams.get('level')
    const includeChildren = searchParams.get('includeChildren') === 'true'
    const includeParent = searchParams.get('includeParent') === 'true'
    const isActive = searchParams.get('active')

    // Build where clause
    const where: any = {}
    if (packageLetter) where.packageLetter = packageLetter
    if (level) where.level = level
    if (isActive !== null) where.isActive = isActive === 'true'

    // Build include clause
    const include: any = {}
    if (includeChildren) {
      include.children = {
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' }
      }
    }
    if (includeParent) {
      include.parent = true
    }

    const templates = await prisma.workItemTemplate.findMany({
      where,
      include,
      orderBy: [
        { packageLetter: 'asc' },
        { displayOrder: 'asc' }
      ]
    })

    // Group templates by package for easier consumption
    const templatesByPackage = templates.reduce((acc: any, template) => {
      const packageKey = template.packageLetter
      if (!acc[packageKey]) {
        acc[packageKey] = {
          packageLetter: template.packageLetter,
          packageName: template.packageName,
          templates: []
        }
      }
      acc[packageKey].templates.push(template)
      return acc
    }, {})

    // Generate statistics
    const stats = {
      totalTemplates: templates.length,
      packageCount: Object.keys(templatesByPackage).length,
      levelDistribution: templates.reduce((acc: any, template) => {
        acc[template.level] = (acc[template.level] || 0) + 1
        return acc
      }, {}),
      activeTemplates: templates.filter(t => t.isActive).length,
      inactiveTemplates: templates.filter(t => !t.isActive).length
    }

    return NextResponse.json({
      templates,
      templatesByPackage: Object.values(templatesByPackage),
      stats
    })
  } catch (error) {
    console.error('Error fetching work item templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch work item templates' },
      { status: 500 }
    )
  }
}

// POST /api/work-item-templates - Create new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { packageLetter, packageName, level, title } = body
    if (!packageLetter || !packageName || !level || !title) {
      return NextResponse.json(
        { error: 'Package letter, package name, level, and title are required' },
        { status: 400 }
      )
    }

    // Validate level
    const validLevels = ['PACKAGE', 'ITEM', 'SUB_ITEM', 'REALIZATION']
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { error: `Level must be one of: ${validLevels.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if parent template exists (if parentTemplateId is provided)
    if (body.parentTemplateId) {
      const parentTemplate = await prisma.workItemTemplate.findUnique({
        where: { id: body.parentTemplateId }
      })
      
      if (!parentTemplate) {
        return NextResponse.json(
          { error: 'Parent template not found' },
          { status: 404 }
        )
      }
    }

    const template = await prisma.workItemTemplate.create({
      data: {
        packageLetter,
        packageName,
        level,
        title,
        itemNumber: body.itemNumber,
        itemTitle: body.itemTitle,
        parentTemplateId: body.parentTemplateId,
        subLetter: body.subLetter,
        description: body.description,
        volume: body.volume ? Number(body.volume) : null,
        unit: body.unit,
        hasRealization: body.hasRealization || false,
        displayOrder: body.displayOrder || 0,
        isActive: body.isActive !== false // Default to true
      },
      include: {
        parent: true,
        children: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating work item template:', error)
    return NextResponse.json(
      { error: 'Failed to create work item template' },
      { status: 500 }
    )
  }
}

// PUT /api/work-item-templates - Bulk update templates
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { templateIds, data } = body

    if (!templateIds || !Array.isArray(templateIds) || templateIds.length === 0) {
      return NextResponse.json(
        { error: 'Template IDs array is required' },
        { status: 400 }
      )
    }

    // Update multiple templates
    const updateResult = await prisma.workItemTemplate.updateMany({
      where: {
        id: { in: templateIds }
      },
      data: {
        isActive: data.isActive,
        displayOrder: data.displayOrder,
        volume: data.volume ? Number(data.volume) : undefined,
        unit: data.unit,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      updated: updateResult.count,
      message: `${updateResult.count} template(s) updated successfully`
    })
  } catch (error) {
    console.error('Error updating work item templates:', error)
    return NextResponse.json(
      { error: 'Failed to update work item templates' },
      { status: 500 }
    )
  }
}

// DELETE /api/work-item-templates - Bulk delete templates
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const templateIds = searchParams.get('ids')?.split(',')

    if (!templateIds || templateIds.length === 0) {
      return NextResponse.json(
        { error: 'Template IDs are required' },
        { status: 400 }
      )
    }

    // Check if templates are being used by work items
    const templatesInUse = await prisma.workItem.findMany({
      where: {
        templateId: { in: templateIds }
      },
      select: {
        templateId: true,
        template: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    if (templatesInUse.length > 0) {
      const usedTemplateIds = [...new Set(templatesInUse.map(wi => wi.templateId))]
      return NextResponse.json(
        {
          error: 'Cannot delete templates that are being used by work items',
          templatesInUse: usedTemplateIds,
          affectedWorkItems: templatesInUse.length
        },
        { status: 409 }
      )
    }

    // Delete templates
    const deleteResult = await prisma.workItemTemplate.deleteMany({
      where: {
        id: { in: templateIds }
      }
    })

    return NextResponse.json({
      deleted: deleteResult.count,
      message: `${deleteResult.count} template(s) deleted successfully`
    })
  } catch (error) {
    console.error('Error deleting work item templates:', error)
    return NextResponse.json(
      { error: 'Failed to delete work item templates' },
      { status: 500 }
    )
  }
}