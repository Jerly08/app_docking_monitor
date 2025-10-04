import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/work-item-templates/packages - Get available packages with template counts and previews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includePreview = searchParams.get('includePreview') === 'true'
    const includeStats = searchParams.get('includeStats') === 'true'

    // Get all unique packages
    const packages = await prisma.workItemTemplate.groupBy({
      by: ['packageLetter', 'packageName'],
      where: {
        level: { not: 'PACKAGE' }, // Exclude package-level templates from count
        isActive: true
      },
      _count: {
        id: true
      },
      orderBy: {
        packageLetter: 'asc'
      }
    })

    const packagesWithDetails = []

    for (const pkg of packages) {
      const packageData: any = {
        packageLetter: pkg.packageLetter,
        packageName: pkg.packageName,
        templateCount: pkg._count.id
      }

      if (includePreview) {
        // Get template preview (first few templates from each package)
        const templatePreview = await prisma.workItemTemplate.findMany({
          where: {
            packageLetter: pkg.packageLetter,
            level: { not: 'PACKAGE' },
            isActive: true
          },
          select: {
            id: true,
            level: true,
            itemNumber: true,
            subLetter: true,
            title: true,
            volume: true,
            unit: true,
            hasRealization: true
          },
          orderBy: [
            { displayOrder: 'asc' }
          ],
          take: 10 // First 10 templates as preview
        })

        packageData.preview = templatePreview
      }

      if (includeStats) {
        // Get detailed statistics for the package
        const packageStats = await prisma.workItemTemplate.findMany({
          where: {
            packageLetter: pkg.packageLetter,
            isActive: true
          },
          select: {
            level: true,
            hasRealization: true
          }
        })

        const levelDistribution = packageStats.reduce((acc: any, template) => {
          acc[template.level] = (acc[template.level] || 0) + 1
          return acc
        }, {})

        packageData.stats = {
          totalTemplates: packageStats.length,
          levelDistribution,
          templatesWithRealization: packageStats.filter(t => t.hasRealization).length,
          templateStructure: {
            items: levelDistribution['ITEM'] || 0,
            subItems: levelDistribution['SUB_ITEM'] || 0,
            realizations: levelDistribution['REALIZATION'] || 0
          }
        }

        // Get usage statistics (how many work items use templates from this package)
        const workItemsUsingPackage = await prisma.workItem.count({
          where: {
            template: {
              packageLetter: pkg.packageLetter
            }
          }
        })

        packageData.usage = {
          workItemsGenerated: workItemsUsingPackage
        }
      }

      packagesWithDetails.push(packageData)
    }

    // Generate overall statistics
    const overallStats = {
      totalPackages: packages.length,
      totalTemplates: packages.reduce((sum, pkg) => sum + pkg._count.id, 0),
      averageTemplatesPerPackage: packages.length > 0 
        ? Math.round(packages.reduce((sum, pkg) => sum + pkg._count.id, 0) / packages.length)
        : 0
    }

    return NextResponse.json({
      packages: packagesWithDetails,
      stats: overallStats,
      availablePackageLetters: packages.map(p => p.packageLetter),
      availablePackageNames: packages.map(p => p.packageName)
    })
  } catch (error) {
    console.error('Error fetching template packages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch template packages' },
      { status: 500 }
    )
  }
}

// POST /api/work-item-templates/packages - Create a new package with initial templates (bulk operation)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { packageLetter, packageName, templates } = body

    // Validate required fields
    if (!packageLetter || !packageName) {
      return NextResponse.json(
        { error: 'Package letter and package name are required' },
        { status: 400 }
      )
    }

    // Check if package already exists
    const existingPackage = await prisma.workItemTemplate.findFirst({
      where: {
        packageLetter,
        level: 'PACKAGE'
      }
    })

    if (existingPackage) {
      return NextResponse.json(
        { error: `Package ${packageLetter} already exists` },
        { status: 409 }
      )
    }

    // Start transaction to create package and templates
    const result = await prisma.$transaction(async (tx) => {
      // Create package-level template
      const packageTemplate = await tx.workItemTemplate.create({
        data: {
          packageLetter,
          packageName,
          level: 'PACKAGE',
          title: packageName,
          displayOrder: 0,
          isActive: true
        }
      })

      // Create individual templates if provided
      const createdTemplates = []
      if (templates && Array.isArray(templates)) {
        for (let i = 0; i < templates.length; i++) {
          const template = templates[i]
          const createdTemplate = await tx.workItemTemplate.create({
            data: {
              ...template,
              packageLetter,
              packageName,
              parentTemplateId: template.parentTemplateId || 
                (template.level === 'ITEM' ? packageTemplate.id : template.parentTemplateId),
              displayOrder: template.displayOrder || (i + 1)
            }
          })
          createdTemplates.push(createdTemplate)
        }
      }

      return {
        packageTemplate,
        templates: createdTemplates,
        totalCreated: createdTemplates.length + 1
      }
    })

    return NextResponse.json({
      message: `Package ${packageLetter} created successfully with ${result.totalCreated} templates`,
      package: result.packageTemplate,
      templates: result.templates,
      stats: {
        packageCreated: 1,
        templatesCreated: result.templates.length,
        totalCreated: result.totalCreated
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating template package:', error)
    return NextResponse.json(
      { error: 'Failed to create template package' },
      { status: 500 }
    )
  }
}