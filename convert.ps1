# PowerShell script to extract data from Excel and save to data.js
# This script uses file attributes (size) to avoid any Korean encoding issues inside the script itself.

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (!$scriptDir) {
    $scriptDir = "C:\Users\MasterPc\Desktop\직원 업무"
}

Write-Host "Script directory: $scriptDir"

# Dynamically find the Excel file by filtering out temporary files (~$*) and finding the smaller edited file (< 30KB)
$excelFile = Get-ChildItem -Path $scriptDir -Filter "*.xlsx" | Where-Object {
    $_.Name -notlike "~$*" -and $_.Length -lt 30000
} | Select-Object -First 1

if (!$excelFile) {
    Write-Host "Error: Could not find any excel file < 30KB in $scriptDir"
    Exit
}

$filePath = $excelFile.FullName
Write-Host "Found Excel file: $filePath"

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false

try {
    $workbook = $excel.Workbooks.Open($filePath)
    $data = @()
    $globalRowId = 1
    
    $sheetCount = $workbook.Sheets.Count
    Write-Host "Total sheets in workbook: $sheetCount"
    
    # Define Unicode character codes for Korean characters to avoid PowerShell encoding syntax errors
    $c_sil = [char]49892; $c_gwa = [char]44236; $c_so = [char]49548; $c_sok = [char]49549
    $c_dam = [char]45812; $c_dang = [char]45817; $c_eop = [char]50629; $c_mu = [char]51788
    $c_haeng = [char]54665; $c_jeong = [char]51221; $c_jeon = [char]51204; $c_hwa = [char]54868
    $c_bu = [char]48512; $c_seo = [char]49436; $c_beon = [char]48264; $c_ho = [char]54840
    $c_bun = [char]48516; $c_jang = [char]51109; $c_nae = [char]45236; $c_seon = [char]49440; $c_yong = [char]50857
    
    $strDept = "$($c_sil)$($c_gwa)$($c_so)"        # 실과소
    $strTeam = "$($c_so)$($c_sok)"                 # 소속
    $strDuty = "$($c_dam)$($c_dang)$($c_eop)$($c_mu)" # 담당업무
    $strPhone = "$($c_haeng)$($c_jeong)$($c_jeon)$($c_hwa)" # 행정전화
    
    $strDeptSub1 = "$($c_bu)$($c_seo)"             # 부서
    $strPhoneSub1 = "$($c_jeon)$($c_hwa)"          # 전화
    $strPhoneSub2 = "$($c_beon)$($c_ho)"          # 번호
    $strDutySub1 = "$($c_eop)$($c_mu)"             # 업무
    $strDutySub2 = "$($c_bun)$($c_jang)"           # 분장
    $strDutySub3 = "$($c_nae)$($c_yong)"           # 내용
    
    $c_gwa_single = [char]44284                    # 과
    $c_sil_single = [char]50900                    # 실
    $c_tim = [char]54016                           # 팀
    
    for ($i = 1; $i -le $sheetCount; $i++) {
        $sheet = $workbook.Sheets.Item($i)
        $sheetName = $sheet.Name
        $usedRange = $sheet.UsedRange
        $rows = $usedRange.Rows.Count
        $cols = $usedRange.Columns.Count
        
        Write-Host "Parsing sheet [$sheetName] total rows: $rows, cols: $cols"
        
        if ($rows -lt 2) {
            continue
        }
        
        # Dynamically lookup indices of columns (1-based index)
        $colDeptIdx = -1
        $colTeamIdx = -1
        $colDutyIdx = -1
        $colPhoneIdx = -1
        
        for ($c = 1; $c -le $cols; $c++) {
            $headerText = $usedRange.Cells.Item(1, $c).Text.Trim().ToLower()
            
            if ($headerText -eq $strDept -or $headerText.Contains($strDept) -or $headerText.Contains($strDeptSub1) -or $headerText.Contains($c_gwa_single) -or $headerText.Contains($c_sil_single)) {
                if ($colDeptIdx -eq -1) { $colDeptIdx = $c }
            }
            if ($headerText -eq $strTeam -or $headerText.Contains($strTeam) -or $headerText.Contains($c_tim) -or $headerText.Contains($c_dam)) {
                if ($colTeamIdx -eq -1) { $colTeamIdx = $c }
            }
            if ($headerText -eq $strDuty -or $headerText.Contains($strDutySub1) -or $headerText.Contains($strDutySub2) -or $headerText.Contains($strDutySub3)) {
                if ($colDutyIdx -eq -1) { $colDutyIdx = $c }
            }
            if ($headerText -eq $strPhone -or $headerText.Contains($strPhoneSub1) -or $headerText.Contains($strPhoneSub2) -or $headerText.Contains($c_haeng) -or $headerText.Contains($c_seon)) {
                if ($colPhoneIdx -eq -1) { $colPhoneIdx = $c }
            }
        }
        
        # Fallbacks (1=Dept, 2=Team, 3=Duty, 4=Phone)
        if ($colDeptIdx -eq -1) { $colDeptIdx = 1 }
        if ($colTeamIdx -eq -1) { $colTeamIdx = 2 }
        if ($colDutyIdx -eq -1) { $colDutyIdx = 3 }
        if ($colPhoneIdx -eq -1) { $colPhoneIdx = 4 }
        
        Write-Host "Mapped columns for [$sheetName] -> Dept:$colDeptIdx, Team:$colTeamIdx, Duty:$colDutyIdx, Phone:$colPhoneIdx"
        
        for ($r = 2; $r -le $rows; $r++) {
            $dept = ""
            $team = ""
            $duty = ""
            $phone = ""
            
            if ($colDeptIdx -le $cols) { $dept = $usedRange.Cells.Item($r, $colDeptIdx).Text.Trim() }
            if ($colTeamIdx -le $cols) { $team = $usedRange.Cells.Item($r, $colTeamIdx).Text.Trim() }
            if ($colDutyIdx -le $cols) { $duty = $usedRange.Cells.Item($r, $colDutyIdx).Text.Trim() }
            if ($colPhoneIdx -le $cols) { $phone = $usedRange.Cells.Item($r, $colPhoneIdx).Text.Trim() }
            
            # Only add if at least one field is populated
            if ($dept -or $team -or $duty -or $phone) {
                $item = [PSCustomObject]@{
                    id = $globalRowId++
                    department = $dept
                    team = $team
                    duty = $duty
                    phone = $phone
                }
                $data += $item
            }
        }
    }
    
    $workbook.Close($false)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    
    # Format and save as data.js
    $json = ConvertTo-Json -InputObject $data -Depth 5
    $jsContent = "window.EXCEL_DATA = $json;"
    
    $outputPath = Join-Path $scriptDir "data.js"
    # UTF8 encoding writes UTF-8 with BOM in Windows PowerShell, which is perfectly read by browsers.
    $jsContent | Out-File -FilePath $outputPath -Encoding utf8
    
    Write-Host "Success! data.js has been generated with $($data.Count) records at: $outputPath"
} catch {
    Write-Host "Error occurred: $_"
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
}
