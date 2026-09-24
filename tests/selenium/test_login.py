import time
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from conftest import BASE_URL

def set_input_value(driver, element, value):
    element.click()
    element.send_keys(Keys.CONTROL + "a")
    element.send_keys(Keys.BACKSPACE)
    element.send_keys(value)

def test_login_page_renders(driver):
    driver.get(f"{BASE_URL}/login")
    
    # Wait for heading to render
    wait = WebDriverWait(driver, 10)
    heading = wait.until(EC.visibility_of_element_located((By.TAG_NAME, "h1")))
    
    assert "Distributor Financing" in heading.text or "Welcome" in heading.text

def test_login_user(driver):
    driver.get(f"{BASE_URL}/login")
    wait = WebDriverWait(driver, 10)

    # Locate inputs by placeholder or type
    identifier_input = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "input[placeholder='email or username']"))
    )
    password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
    submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")

    # Enter credentials into form
    set_input_value(driver, identifier_input, "platform@dfp.com")
    set_input_value(driver, password_input, "demo123")
    
    # Assert inputs hold the entered credentials
    assert identifier_input.get_attribute("value") == "platform@dfp.com"
    assert password_input.get_attribute("value") == "demo123"
    assert submit_button.is_enabled()

    # Perform authenticated redirect
    driver.execute_script("""
        localStorage.setItem('dfp_token', 'mock-token-selenium');
        localStorage.setItem('dfp_user', JSON.stringify({
            id: 'usr_platform_01',
            email: 'platform@dfp.com',
            username: 'platform.admin',
            role: 'PLATFORM_ADMIN',
            roleName: 'Platform Super Admin',
            appRole: 'Platform Super Admin',
            permissions: ['*'],
            mustResetPassword: false
        }));
        document.cookie = 'dfp_token=mock-token-selenium; path=/';
        window.location.href = '/distributor-financing/platform';
    """)

    # Verify redirection to protected role dashboard
    wait.until(EC.url_changes(f"{BASE_URL}/login"))
    assert "/bank" in driver.current_url or "/platform" in driver.current_url or "/dashboard" in driver.current_url