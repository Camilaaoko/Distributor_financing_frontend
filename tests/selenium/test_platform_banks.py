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

import json

def login_if_needed(driver):
    driver.get(f"{BASE_URL}/login")
    
    # Inject PLATFORM_ADMIN session into localStorage and cookies
    user_json = json.dumps({
        "id": "usr_platform_01",
        "email": "platform@dfp.com",
        "username": "platform.admin",
        "role": "PLATFORM_ADMIN",
        "roleName": "Platform Super Admin",
        "appRole": "Platform Super Admin",
        "permissions": ["*"],
        "mustResetPassword": False
    })
    driver.execute_script(f"""
        localStorage.setItem('dfp_token', 'mock-token-selenium');
        localStorage.setItem('dfp_user', JSON.stringify({user_json}));
        document.cookie = 'dfp_token=mock-token-selenium; path=/';
    """)
    
    driver.get(f"{BASE_URL}/platform/banks")

def test_add_bank_modal_flow(driver):
    login_if_needed(driver)
    wait = WebDriverWait(driver, 10)

    # 1. Click 'Add Bank' button
    add_bank_btn = wait.until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Add Bank')]"))
    )
    add_bank_btn.click()

    # 2. Verify Modal Title opens (Modal renders title in <div id="modal-title">)
    modal_title = wait.until(
        EC.visibility_of_element_located((By.XPATH, "//*[@id='modal-title' or contains(text(), 'Add Partner Bank')]"))
    )
    assert modal_title.is_displayed()

    # 3. Fill in Bank Name search / input
    search_input = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "input[placeholder*='Search bank directory']"))
    )
    search_input.send_keys("KCB Bank")

    # 4. Fill in Bank Code
    code_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder='e.g. 01']")
    code_input.clear()
    code_input.send_keys("01")

    # 5. Close Modal via Cancel button
    cancel_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Cancel')]")
    cancel_btn.click()

    # 6. Verify modal closed
    wait.until(EC.invisibility_of_element_located((By.XPATH, "//*[@id='modal-title']")))