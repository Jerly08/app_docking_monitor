@echo off
echo Testing Add Realization Item API Endpoint
echo ==========================================

set BASE_URL=http://localhost:3000
set ENDPOINT=%BASE_URL%/api/work-items

echo Target endpoint: %ENDPOINT%
echo.

echo Testing basic realization item creation...
echo.

echo JSON Payload:
echo {
echo   "title": "Test realization - kapal ringan sebagai berikut",
echo   "description": "SELESAI 100%",
echo   "package": "PELAYANAN UMUM", 
echo   "volume": 1,
echo   "unit": "ls",
echo   "durationDays": 17,
echo   "resourceNames": "test02",
echo   "isMilestone": false,
echo   "startDate": "",
echo   "finishDate": "",
echo   "completion": 0,
echo   "projectId": "test-project-id",
echo   "parentId": "test-parent-id"
echo }
echo.

echo Sending POST request...
curl -X POST "%ENDPOINT%" ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Test realization - kapal ringan sebagai berikut\",\"description\":\"SELESAI 100%\",\"package\":\"PELAYANAN UMUM\",\"volume\":1,\"unit\":\"ls\",\"durationDays\":17,\"resourceNames\":\"test02\",\"isMilestone\":false,\"startDate\":\"\",\"finishDate\":\"\",\"completion\":0,\"projectId\":\"test-project-id\",\"parentId\":\"test-parent-id\"}" ^
  -v ^
  --max-time 30

echo.
echo Test completed. Check the output above for response details.
echo.
pause