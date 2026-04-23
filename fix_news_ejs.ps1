$content = Get-Content 'c:\Users\Danie\OneDrive\Desktop\IND\replica_node\views\index.ejs' -Raw -Encoding UTF8

$old = @'
            <div class="section-title-wrap">
                <span class="section-tag">Stay Updated</span>
                <h2 class="section-title">News &amp; Events</h2>
            </div>
'@

$new = @'
            <div class="section-title-wrap text-center center" style="text-align: center;">
                <h2 class="section-title">News &amp; Events</h2>
                <span class="section-tag" style="display:inline-block; margin-top: 10px;">Stay Updated</span>
            </div>
'@

$content = $content.Replace($old, $new)
Set-Content 'c:\Users\Danie\OneDrive\Desktop\IND\replica_node\views\index.ejs' -Value $content -Encoding UTF8
Write-Host "Done EJS"
