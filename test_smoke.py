from playwright.sync_api import sync_playwright
from pathlib import Path
base=Path(__file__).parent
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8793/index.html',wait_until='domcontentloaded')
 page.wait_for_timeout(600)
 print('survey title',page.title())
 for n in ['reason','familiarity','clarity','gender']:assert page.locator(f'input[name="{n}"]').count()>0,n
 assert page.locator('#demo-banner').is_visible()
 # Conditional required field validation
 page.locator('input[name="reason"][value="otro"]').check()
 assert page.locator('#reason-other-wrap').is_visible()
 page.locator('input[name="familiarity"][value="2"]').check()
 page.locator('input[name="clarity"][value="4"]').check()
 page.locator('#age-years').fill('20')
 page.locator('input[name="gender"][value="prefiero_no_responder"]').check()
 assert page.locator('#progress-fill').get_attribute('style')=='width: 100%;'
 page.locator('#send-button').click()
 assert page.locator('#form-error').is_visible()
 assert page.locator('#success-panel').is_hidden()
 page.locator('#reason-other').fill('Orientación sobre becas')
 page.locator('#send-button').click()
 assert page.locator('#success-panel').is_visible()
 assert 'NO fue guardada' in page.locator('#success-copy').inner_text()
 page.screenshot(path='/mnt/data/feria_collahuasi_movil_v2.png',full_page=True)
 page.locator('#restart-button').click()
 page.locator('input[name="reason"][value="aprendices"]').check()
 page.locator('input[name="familiarity"][value="0"]').check()
 page.locator('input[name="clarity"][value="0"]').check()
 page.locator('#age-optout').check()
 page.locator('input[name="gender"][value="mujer"]').check()
 page.locator('#send-button').click()
 assert page.locator('#success-panel').is_visible()
 page2=browser.new_page(viewport={'width':1440,'height':950},device_scale_factor=1)
 page2.on('pageerror',lambda e:errors.append(str(e)))
 page2.goto('http://127.0.0.1:8793/admin.html',wait_until='domcontentloaded')
 page2.wait_for_timeout(1250)
 print('dashboard title',page2.title())
 assert page2.locator('#dashboard-screen').is_visible()
 assert 'SIMULACIÓN' in page2.locator('#mode-pill').inner_text()
 print('responses',page2.locator('#kpi-responses').inner_text(),'aprendices',page2.locator('#kpi-aprendices').inner_text())
 assert page2.locator('#reason-bars .bar-row').count()>2
 assert page2.locator('#reason-young-bars .bar-row').count()>2
 page2.locator('#filter-reason').select_option('aprendices')
 assert page2.locator('#kpi-aprendices').inner_text()=='100,0 %'
 page2.screenshot(path='/mnt/data/feria_collahuasi_panel_v2.png',full_page=True)
 print('JS ERRORS',errors)
 assert not errors
 browser.close()
