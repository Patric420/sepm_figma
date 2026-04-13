$ErrorActionPreference = "Continue"

Write-Host "Ensuring Microsoft Graph modules are installed..."
if (!(Get-Module -ListAvailable -Name Microsoft.Graph.Authentication)) {
    Write-Host "Installing Microsoft.Graph.Authentication..."
    Install-Module Microsoft.Graph.Authentication -Scope CurrentUser -Force -AllowClobber
}
if (!(Get-Module -ListAvailable -Name Microsoft.Graph.Planner)) {
    Write-Host "Installing Microsoft.Graph.Planner..."
    Install-Module Microsoft.Graph.Planner -Scope CurrentUser -Force -AllowClobber
}

Import-Module Microsoft.Graph.Authentication
Import-Module Microsoft.Graph.Planner

$planId = "j2_Lq8lys0aQQUJKNTut0MkAFR0I"

Write-Host "Connecting to Microsoft Graph with Device Authentication..."
Write-Host "YOU MUST GO TO https://microsoft.com/devicelogin AND ENTER THE CODE!"
Connect-MgGraph -Scopes "Tasks.ReadWrite","Group.Read.All" -UseDeviceAuthentication

Write-Host "Authenticated successfully!"
function Add-PlannerBucket($name) {
    $existing = Get-MgPlannerPlanBucket -PlannerPlanId $planId | Where-Object Name -eq $name
    if ($existing) { return $existing[0].Id }
    $bucket = New-MgPlannerPlanBucket -Name $name -PlanId $planId
    return $bucket.Id
}

Write-Host "Provisioning Buckets..."
$b1 = Add-PlannerBucket "1. Setup and Design"
$b2 = Add-PlannerBucket "2. Frontend Engineering"
$b3 = Add-PlannerBucket "3. Backend Engineering"
$b4 = Add-PlannerBucket "4. Active Sprint To-Do"
$b5 = Add-PlannerBucket "5. Launch and Marketing"

function Add-TaskWithDesc($bucketId, $title, $description, $percent) {
    Write-Host "Adding Task: $title"
    $task = New-MgPlannerTask -PlanId $planId -BucketId $bucketId -Title $title -PercentComplete $percent
    if ($description) {
        Start-Sleep -Seconds 1
        $retries = 3
        while ($retries -gt 0) {
            try {
                $details = Get-MgPlannerTaskDetail -PlannerTaskId $task.Id
                $etag = $details.OdataEtag
                if ($etag) {
                    Update-MgPlannerTaskDetail -PlannerTaskId $task.Id -Description $description -IfMatch $etag -ErrorAction Stop
                }
                break
            } catch {
                $retries--
                Start-Sleep -Seconds 2
            }
        }
    }
}

Write-Host "Adding Tasks..."
Add-TaskWithDesc $b1 "UI and UX Wireframing" "Translating initial SaaS Figma designs to focus on the AutoSOW concept with a unified color palette and typography (Inter)." 100
Add-TaskWithDesc $b1 "Initial Scaffolding" "Setting up the Vite React frontend and Node.js Express backend running concurrently. Setup Tailwind CSS." 100

Add-TaskWithDesc $b2 "Authentication Flow UI" "Implementing the modal for User Sign-Up and Login, managing global state." 100
Add-TaskWithDesc $b2 "Specialized AutoSOW Dashboard" "Building dual-pane UI component for transcript input and SOW generation preview." 100
Add-TaskWithDesc $b2 "UI Theme and Dark Mode" "Handling seamless dark mode toggling mirroring OS-level preferences." 100

Add-TaskWithDesc $b3 "JWT Security Implementation" "Securing API endpoints using bcryptjs and jsonwebtoken." 100
Add-TaskWithDesc $b3 "SOW API Endpoint" "Building express route to accept transcripts and return mock Markdown SOW docs." 100
Add-TaskWithDesc $b3 "Waitlist Lead Capture" "Endpoint to capture emails from the hero section." 100

Add-TaskWithDesc $b4 "Real LLM API Integration" "Replace simulated timeout with an actual call to OpenAI Anthropic APIs to parse transcripts." 0
Add-TaskWithDesc $b4 "File Upload Support" "Allow users to upload physical transcription files replacing raw text paste." 0
Add-TaskWithDesc $b4 "PDF Export Functionality" "Add Download as PDF button next to Copy Markdown." 0

Add-TaskWithDesc $b5 "Setup Email Campaigns" "Email sequence for leads from leads.json." 0
Add-TaskWithDesc $b5 "Record Demo Walkthrough" "Create a high-quality screen recording demonstrating the core value loop." 0

Write-Host "All done! Check your Microsoft Planner board."
