# Create Excel Application
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$workbook = $excel.Workbooks.Add()
$worksheet = $workbook.Worksheets.Item(1)
$worksheet.Name = 'Work Items Template'

# Define headers
$headers = @(
    'ID', 'Level', 'Parent_ID', 'Package', 'Task_Name', 
    'Duration_Days', 'Start_Date', 'Finish_Date', 'Percent_Complete', 
    'Resource_Names', 'Milestone', 'Notes', 'Status'
)

# Add headers
for ($i = 0; $i -lt $headers.Length; $i++) {
    $worksheet.Cells.Item(1, $i + 1) = $headers[$i]
    $worksheet.Cells.Item(1, $i + 1).Font.Bold = $true
    $worksheet.Cells.Item(1, $i + 1).Interior.ColorIndex = 15
}

# Add sample data from your project
$sampleData = @(
    @('WP-OCE-001', '1', '', 'PELAYANAN UMUM', 'Diberikan aliran listrik dari darat ke kapal selam', '', '2025-10-10', '2025-10-11', '56%', 'gras teit', 'TRUE', 'Click to view full detail', 'ACTIVE'),
    @('WP-OCE-001-T01', '2', 'WP-OCE-001', 'LEGACY', 'Realisasi', '10', '2025-10-11', '2025-10-20', '12%', 'test', 'FALSE', 'Click to view full detail', 'ACTIVE'),
    @('WP-OCE-001-T02', '2', 'WP-OCE-001', 'REALISASI', 'Diselesaikan crane untuk bongkar / pasang perance dan nai', '17', 'mm/dd/yyyy', 'mm/dd/yyyy', '100%', 'test02', 'FALSE', 'Click to view full detail', 'COMPLETED')
)

# Add sample data
$row = 2
foreach ($dataRow in $sampleData) {
    for ($col = 0; $col -lt $dataRow.Length; $col++) {
        $worksheet.Cells.Item($row, $col + 1) = $dataRow[$col]
        # Indent child tasks (Level 2)
        if ($col -eq 4 -and $dataRow[1] -eq '2') {
            $worksheet.Cells.Item($row, $col + 1).IndentLevel = 1
        }
    }
    $row++
}

# Add empty template rows
$row += 2
$worksheet.Cells.Item($row, 1) = '=== TEMPLATE SECTION ==='
$worksheet.Cells.Item($row, 1).Font.Bold = $true
$worksheet.Cells.Item($row, 1).Interior.ColorIndex = 6
$row++

# Template parent task
$templateParent = @('TEMPLATE_PARENT_001', '1', '', 'PACKAGE_NAME', 'PARENT_TASK_NAME', 'DURATION', 'START_DATE', 'END_DATE', '0%', 'RESOURCE_NAME', 'TRUE/FALSE', 'NOTES', 'ACTIVE')
for ($col = 0; $col -lt $templateParent.Length; $col++) {
    $worksheet.Cells.Item($row, $col + 1) = $templateParent[$col]
}
$row++

# Template child tasks
$templateChild1 = @('TEMPLATE_PARENT_001_SUB1', '2', 'TEMPLATE_PARENT_001', 'SUB_PACKAGE', 'CHILD_TASK_NAME_1', 'DURATION', 'START_DATE', 'END_DATE', '0%', 'RESOURCE_NAME', 'TRUE/FALSE', 'NOTES', 'ACTIVE')
for ($col = 0; $col -lt $templateChild1.Length; $col++) {
    $worksheet.Cells.Item($row, $col + 1) = $templateChild1[$col]
    if ($col -eq 4) { $worksheet.Cells.Item($row, $col + 1).IndentLevel = 1 }
}
$row++

$templateChild2 = @('TEMPLATE_PARENT_001_SUB2', '2', 'TEMPLATE_PARENT_001', 'SUB_PACKAGE', 'CHILD_TASK_NAME_2', 'DURATION', 'START_DATE', 'END_DATE', '0%', 'RESOURCE_NAME', 'TRUE/FALSE', 'NOTES', 'ACTIVE')
for ($col = 0; $col -lt $templateChild2.Length; $col++) {
    $worksheet.Cells.Item($row, $col + 1) = $templateChild2[$col]
    if ($col -eq 4) { $worksheet.Cells.Item($row, $col + 1).IndentLevel = 1 }
}

# Auto-fit columns
$worksheet.Columns.AutoFit() | Out-Null

# Add a second worksheet for instructions
$instructionSheet = $workbook.Worksheets.Add()
$instructionSheet.Name = 'Instructions'

$instructions = @(
    'Work Items Template - Instructions',
    '',
    'Column Descriptions:',
    'ID: Unique identifier for each work item (e.g., WP-OCE-001)',
    'Level: 1 for parent tasks, 2 for child tasks, 3 for sub-child tasks, etc.',
    'Parent_ID: Leave blank for parent tasks, enter parent ID for child tasks',
    'Package: Category or package name (e.g., LEGACY, PELAYANAN UMUM, REALISASI)',
    'Task_Name: Description of the work item',
    'Duration_Days: Number of days to complete the task',
    'Start_Date: Task start date (format: YYYY-MM-DD)',
    'Finish_Date: Task end date (format: YYYY-MM-DD)',
    'Percent_Complete: Progress percentage (e.g., 56%)',
    'Resource_Names: Person or team assigned to the task',
    'Milestone: TRUE for milestone tasks, FALSE for regular tasks',
    'Notes: Additional comments or details',
    'Status: ACTIVE, COMPLETED, ON_HOLD, etc.',
    '',
    'How to use:',
    '1. Copy the template rows and modify them for your needs',
    '2. For parent tasks: Set Level = 1, leave Parent_ID blank',
    '3. For child tasks: Set Level = 2, set Parent_ID to the parent task ID',
    '4. Use consistent ID naming (e.g., WP-OCE-001, WP-OCE-001-T01, WP-OCE-001-T02)',
    '5. Child tasks will be automatically indented in the Task_Name column'
)

for ($i = 0; $i -lt $instructions.Length; $i++) {
    $instructionSheet.Cells.Item($i + 1, 1) = $instructions[$i]
    if ($i -eq 0 -or $i -eq 2 -or $i -eq 17) {
        $instructionSheet.Cells.Item($i + 1, 1).Font.Bold = $true
    }
}
$instructionSheet.Columns.AutoFit() | Out-Null

# Save the workbook
$filePath = 'D:\Project\app_monitoring_proyek\Work_Items_Template.xlsx'
$workbook.SaveAs($filePath)
$workbook.Close()
$excel.Quit()

# Release COM objects
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($worksheet) | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($instructionSheet) | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($workbook) | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
[System.GC]::Collect()

Write-Output "Excel template created successfully at: $filePath"