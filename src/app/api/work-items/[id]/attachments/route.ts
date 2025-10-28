import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

// POST /api/work-items/[id]/attachments - Upload attachments for a work item
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workItemId = decodeURIComponent(params.id)
    
    // Verify work item exists
    const workItem = await prisma.workItem.findUnique({
      where: { id: workItemId },
      select: { id: true, title: true, projectId: true }
    })
    
    if (!workItem) {
      return NextResponse.json(
        { error: 'Work item not found' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'work-items')
    await mkdir(uploadsDir, { recursive: true })

    const attachments = []

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        continue // Skip non-image files
      }

      // Generate unique filename
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()
      const fileName = `${workItemId}-${timestamp}.${fileExtension}`
      const filePath = path.join(uploadsDir, fileName)

      // Save file to disk
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Create attachment record in database
      const attachment = await prisma.workItemAttachment.create({
        data: {
          fileName: file.name,
          fileUrl: `/uploads/work-items/${fileName}`,
          fileSize: file.size,
          mimeType: file.type,
          workItemId: workItemId
        }
      })

      attachments.push(attachment)
    }

    return NextResponse.json({
      message: `${attachments.length} attachments uploaded successfully`,
      attachments
    })

  } catch (error) {
    console.error('Error uploading attachments:', error)
    return NextResponse.json(
      { error: 'Failed to upload attachments' },
      { status: 500 }
    )
  }
}

// GET /api/work-items/[id]/attachments - Get attachments for a work item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workItemId = decodeURIComponent(params.id)
    
    const attachments = await prisma.workItemAttachment.findMany({
      where: { workItemId },
      orderBy: { uploadedAt: 'desc' }
    })

    return NextResponse.json({ attachments })

  } catch (error) {
    console.error('Error fetching attachments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attachments' },
      { status: 500 }
    )
  }
}

// DELETE /api/work-items/[id]/attachments - Delete an attachment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const attachmentId = searchParams.get('attachmentId')
    
    if (!attachmentId) {
      return NextResponse.json(
        { error: 'Attachment ID is required' },
        { status: 400 }
      )
    }

    const attachment = await prisma.workItemAttachment.findUnique({
      where: { id: attachmentId }
    })

    if (!attachment) {
      return NextResponse.json(
        { error: 'Attachment not found' },
        { status: 404 }
      )
    }

    // Delete from database
    await prisma.workItemAttachment.delete({
      where: { id: attachmentId }
    })

    // Optionally delete file from disk
    try {
      const fs = require('fs').promises
      const filePath = path.join(process.cwd(), 'public', attachment.fileUrl)
      await fs.unlink(filePath)
    } catch (fileError) {
      console.warn('Could not delete file from disk:', fileError)
    }

    return NextResponse.json({
      message: 'Attachment deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting attachment:', error)
    return NextResponse.json(
      { error: 'Failed to delete attachment' },
      { status: 500 }
    )
  }
}