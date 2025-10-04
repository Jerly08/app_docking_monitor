import { NextRequest, NextResponse } from 'next/server'
import { pdfService } from '@/lib/pdfService'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { projectId, projectName } = await request.json()
    
    // Fetch work items from database
    let workItems
    if (projectId) {
      // Filter by specific project
      workItems = await prisma.workItem.findMany({
        where: {
          // Add project filtering logic here if you have project relation
        },
        orderBy: {
          createdAt: 'asc'
        }
      })
    } else {
      // Get all work items
      workItems = await prisma.workItem.findMany({
        orderBy: {
          createdAt: 'asc'
        }
      })
    }

    // Calculate statistics
    const totalTasks = workItems.length
    const avgCompletion = totalTasks > 0 
      ? Math.round(workItems.reduce((sum, item) => sum + item.completion, 0) / totalTasks)
      : 0
    const milestones = workItems.filter(item => item.isMilestone).length

    // Prepare data for PDF generation dengan format sesuai work items table
    const reportData = {
      projectName: projectName || 'MT. FERIMAS SEJAHTERA',
      reportDate: new Date().toLocaleDateString('id-ID'),
      workItems: workItems.map(item => ({
        id: item.id,
        title: item.title || 'Unnamed Task',
        completion: item.completion || 0,
        resourceNames: item.resourceNames || 'Harbor Pilot, Dock Master',
        startDate: item.startDate,
        finishDate: item.finishDate,
        durationDays: item.durationDays || 1,
        package: item.package || 'Pelayanan Umum',
        isMilestone: item.isMilestone || false
      })),
      totalTasks,
      avgCompletion,
      milestones
    }

    // Generate PDF using template
    const pdfBuffer = await pdfService.generateWorkPlanReport(reportData)

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Work_Plan_Report_${new Date().toISOString().split('T')[0]}.docx"`
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