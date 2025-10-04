import { NextRequest, NextResponse } from 'next/server'
import { PDFGeneratorService } from '../../../../lib/pdfGeneratorService'
import { fullBorderPdfService } from '../../../../lib/fullBorderPdfService'
import { exactReplicaPdfService } from '../../../../lib/exactReplicaPdfService'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const pdfGeneratorService = new PDFGeneratorService()

export async function POST(request: NextRequest) {
  try {
    const { projectId, projectName, generateForProject } = await request.json()
    
    let project = null
    let workItems = []

    if (projectId || generateForProject) {
      const targetProjectId = projectId || generateForProject
      
      // Fetch project with vessel specifications
      project = await prisma.project.findUnique({
        where: { id: targetProjectId },
        include: {
          workItems: {
            include: {
              children: true,
              parent: true,
              template: {
                select: {
                  packageLetter: true,
                  packageName: true,
                  level: true,
                  itemNumber: true,
                  subLetter: true
                }
              }
            },
            orderBy: [
              { package: 'asc' },
              { createdAt: 'asc' }
            ]
          }
        }
      })

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        )
      }

      workItems = project.workItems
    } else {
      // Get all work items (backward compatibility)
      workItems = await prisma.workItem.findMany({
        include: {
          children: true,
          parent: true,
          project: {
            select: {
              projectName: true,
              vesselName: true,
              vesselSpecs: true
            }
          },
          template: {
            select: {
              packageLetter: true,
              packageName: true,
              level: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      })
    }

    // Calculate statistics
    const totalTasks = workItems.length
    const avgCompletion = totalTasks > 0 
      ? Math.round(workItems.reduce((sum: number, item: any) => sum + item.completion, 0) / totalTasks)
      : 0
    const milestones = workItems.filter((item: any) => item.isMilestone).length
    const conflictedTasks = workItems.filter((item: any) => item.completion < 50 || item.status === 'BLOCKED').length

    // Process hierarchical work items untuk report format
    const processWorkItemsForReport = (items: any[]) => {
      const packageGroups: any = {}
      
      items.forEach(item => {
        const packageName = item.package || 'PELAYANAN UMUM'
        if (!packageGroups[packageName]) {
          packageGroups[packageName] = {
            packageName,
            packageLetter: item.template?.packageLetter || 'A',
            items: []
          }
        }
        
        // Only include parent items in main list
        if (!item.parentId) {
          const processedItem = {
            id: item.id,
            title: item.title,
            volume: item.volume,
            unit: item.unit,
            completion: item.completion,
            status: item.completion === 100 ? 'SELESAI 100%' : 
                   item.completion >= 75 ? 'HAMPIR SELESAI' :
                   item.completion >= 50 ? 'SEDANG PROGRESS' :
                   item.completion >= 25 ? 'MULAI DIKERJAKAN' : 'BELUM DIMULAI',
            resourceNames: item.resourceNames || 'Team',
            isMilestone: item.isMilestone || false,
            startDate: item.startDate,
            finishDate: item.finishDate,
            durationDays: item.durationDays || 1,
            package: item.package || 'PELAYANAN UMUM',
            children: item.children?.map((child: any) => ({
              id: child.id,
              title: child.title,
              volume: child.volume,
              unit: child.unit,
              completion: child.completion,
              status: child.completion === 100 ? 'SELESAI 100%' : 'DALAM PROGRESS',
              description: child.description,
              resourceNames: child.resourceNames || 'Team',
              isMilestone: false
            })) || [],
            hasChildren: item.children && item.children.length > 0
          }
          
          packageGroups[packageName].items.push(processedItem)
        }
      })
      
      return Object.values(packageGroups)
    }

    // Try to find customer contact data for this vessel
    let customerContact = null
    if (project && project.vesselName) {
      try {
        // Mock customer contacts - in real implementation, this would query database
        const mockCustomers = [
          {
            vesselName: 'MT. FERIMAS SEJAHTERA',
            ownerCompany: 'PT. Indoline Incomekita',
            vesselType: 'OIL TANKER',
            grt: 762,
            loa: 64.02,
            lbp: 59.90,
            breadth: 10.00,
            depth: 4.50,
            status: 'SPECIAL SURVEY'
          },
          {
            vesselName: 'MV. OCEAN STAR',
            ownerCompany: 'PT. Marine Solutions', 
            vesselType: 'CARGO SHIP',
            grt: 1200,
            loa: 85.50,
            lbp: 78.20,
            breadth: 12.50,
            depth: 6.80,
            status: 'MAINTENANCE'
          }
        ]
        
        customerContact = mockCustomers.find(c => 
          c.vesselName.toLowerCase().includes(project.vesselName.toLowerCase()) ||
          project.vesselName.toLowerCase().includes(c.vesselName.toLowerCase())
        )
      } catch (error) {
        console.log('Could not fetch customer contact data:', error)
      }
    }

    // Determine vessel information - prioritize customer contact data
    const vesselInfo = {
      name: customerContact?.vesselName || project?.vesselName || 'MT. FERIMAS SEJAHTERA',
      owner: customerContact?.ownerCompany || project?.customerCompany || 'PT. Indoline Incomekita',
      loa: customerContact ? `${customerContact.loa} meter` : (project?.vesselSpecs?.loa || '64.02 meter'),
      lpp: customerContact ? `${customerContact.lbp} meter` : (project?.vesselSpecs?.lpp || '59.90 meter'),
      breadth: customerContact ? `${customerContact.breadth} meter` : (project?.vesselSpecs?.breadth || '10.00 meter'),
      depth: customerContact ? `${customerContact.depth} meter` : (project?.vesselSpecs?.depth || '4.50 meter'),
      dwt_gt: customerContact ? `${customerContact.grt} GT` : (project?.vesselSpecs?.dwt_gt || '762 GT'),
      dok_type: project?.vesselSpecs?.dok_type || 'Special Survey',
      vessel_type: customerContact?.vesselType || project?.vesselSpecs?.vessel_type || 'OIL TANKER',
      status: customerContact?.status || project?.vesselSpecs?.status || 'SPECIAL SURVEY'
    }

    // Prepare data for PDF generation
    const reportData = {
      // Project information
      projectName: project?.projectName || projectName || `${vesselInfo.name} / TAHUN ${new Date().getFullYear()}`,
      reportTitle: 'DOCKING REPORT',
      reportDate: new Date().toLocaleDateString('id-ID'),
      
      // Vessel information
      vesselInfo,
      
      // Work items data (processed packageGroups for compatibility)
      packageGroups: processWorkItemsForReport(workItems) as any[],
      workItems: workItems.map((item: any) => ({
        id: item.id,
        title: item.title || 'Unnamed Task',
        completion: item.completion || 0,
        resourceNames: item.resourceNames || '',
        startDate: item.startDate,
        finishDate: item.finishDate,
        durationDays: item.durationDays || 1,
        package: item.package || 'Pelayanan Umum',
        isMilestone: item.isMilestone || false,
        volume: item.volume,
        unit: item.unit,
        status: item.status
      })),
      
      // Statistics
      totalTasks,
      avgCompletion,
      milestones,
      conflictedTasks,
      
      // Project context
      project: project ? {
        id: project.id,
        name: project.projectName,
        vessel: project.vesselName,
        customer: project.customerCompany,
        status: project.status
      } : null
    }

    // Use exact replica PDF service that matches 100% with reference image
    const pdfBuffer = await exactReplicaPdfService.generateProjectReportPDF(reportData)
    const contentType = 'application/pdf'
    const fileExtension = 'pdf'

    // Generate filename based on project information
    const vesselName = vesselInfo.name.replace(/[^a-zA-Z0-9]/g, '_')
    const currentDate = new Date().toISOString().split('T')[0]
    const filename = project 
      ? `Docking_Report_${vesselName}_${currentDate}.${fileExtension}`
      : `Work_Plan_Report_${currentDate}.${fileExtension}`

    // Return document as response
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Report-Info': JSON.stringify({
          projectId: project?.id,
          projectName: project?.projectName,
          vesselName: vesselInfo.name,
          totalTasks,
          avgCompletion,
          generatedAt: new Date().toISOString()
        })
      }
    })

  } catch (error) {
    console.error('Error generating work plan report:', error)
    return NextResponse.json(
      { error: 'Failed to generate work plan report' },
      { status: 500 }
    )
  }
}

// GET endpoint untuk download template kosong
export async function GET() {
  try {
    const fs = require('fs')
    const path = require('path')
    
    const templatePath = path.join(process.cwd(), 'public', 'kopsurat', 'Kop Surat PT PID - Kemayoran.docx')
    const templateBuffer = fs.readFileSync(templatePath)
    
    return new NextResponse(templateBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="Template_Work_Plan.docx"'
      }
    })
    
  } catch (error) {
    console.error('Error downloading template:', error)
    return NextResponse.json(
      { error: 'Template not found' },
      { status: 404 }
    )
  }
}