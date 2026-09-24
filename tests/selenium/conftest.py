import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

BASE_URL = "http://localhost:3000/distributor-financing"

@pytest.fixture(scope="session")
def driver():
    # Setup Chrome options
    options = webdriver.ChromeOptions()
    # options.add_argument("--headless")  # Uncomment for CI/CD headless execution
    options.add_argument("--window-size=1440,900")
    
    # Auto-download matching ChromeDriver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.implicitly_wait(5)
    
    yield driver
    
    driver.quit()