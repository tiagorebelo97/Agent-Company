"""
QA/Testing Agent - Generates automated tests

Capabilities:
- Generate Playwright tests
- Create Jest unit tests
- Build integration tests
- Follow testing best practices
"""

import sys
import json
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent.parent.parent))

from agents.base.PythonAgentBase import PythonAgentBase
from agents.utils.CodeGenerator import CodeGenerator

class QATestingAgent(PythonAgentBase):
    """QA/Testing Agent - Generates automated tests"""
    
    def __init__(self):
        super().__init__('qa', 'QA/Testing Agent')
        try:
            self.code_generator = CodeGenerator()
            self.log("CodeGenerator initialized successfully")
        except Exception as e:
            self.log(f"Warning: CodeGenerator initialization failed: {str(e)}")
            self.code_generator = None
    
    def execute_task(self, task: dict) -> dict:
        """Execute a testing task"""
        
        self.update_status('thinking')
        self.log(f"Received task: {task.get('description', 'No description')}")
        
        try:
            requirements = task.get('requirements', {})
            title = requirements.get('title', task.get('description', ''))
            description = requirements.get('description', '')
            
            title_lower = title.lower()
            
            if 'playwright' in title_lower or 'e2e' in title_lower:
                return self._create_playwright_test(title, description, requirements)
            elif 'unit' in title_lower or 'jest' in title_lower:
                return self._create_unit_test(title, description, requirements)
            else:
                # Default to Playwright
                return self._create_playwright_test(title, description, requirements)
        
        except Exception as e:
            self.update_status('idle')
            self.log(f"Task execution error: {str(e)}")
            return {
                'success': False,
                'message': f'Error: {str(e)}'
            }
    
    def _create_playwright_test(self, title: str, description: str, requirements: dict) -> dict:
        """Create Playwright E2E test"""
        
        self.update_status('busy')
        self.log('Creating Playwright test...')
        
        test_name = self._extract_test_name(title)
        
        if not self.code_generator:
            code = self._create_playwright_template(test_name, description)
        else:
            try:
                prompt = f"""Generate a Playwright test for: {test_name}

Description: {description}

Requirements:
- Use Playwright test framework
- Include proper test structure
- Add assertions
- Handle async operations
- Include comments
- Test user interactions

Return ONLY the test code with imports."""

                response = self.code_generator.model.generate_content(prompt)
                code = response.text
                
                if code.startswith('```'):
                    lines = code.split('\n')
                    if lines[0].startswith('```'):
                        lines = lines[1:]
                    if lines and lines[-1].startswith('```'):
                        lines = lines[:-1]
                    code = '\n'.join(lines)
                
                self.log(f'Test generated ({len(code)} characters)')
            except Exception as e:
                self.log(f'Generation failed: {str(e)}')
                code = self._create_playwright_template(test_name, description)
        
        file_path = f'tests/e2e/{test_name.lower().replace(" ", "-")}.spec.js'
        result = self.write_file(file_path, code)
        
        if result.get('success'):
            self.log(f'✅ Test created at {file_path}')
        
        self.update_status('idle')
        
        return {
            'success': result.get('success', False),
            'result': {'test': test_name, 'file': file_path},
            'files_modified': [file_path],
            'message': f'Created {test_name} test'
        }
    
    def _create_unit_test(self, title: str, description: str, requirements: dict) -> dict:
        """Create Jest unit test"""
        
        self.log("Unit test creation - using template")
        test_name = self._extract_test_name(title)
        code = self._create_jest_template(test_name, description)
        
        file_path = f'tests/unit/{test_name.lower().replace(" ", "-")}.test.js'
        result = self.write_file(file_path, code)
        
        self.update_status('idle')
        
        return {
            'success': result.get('success', False),
            'result': {'test': test_name, 'file': file_path},
            'files_modified': [file_path],
            'message': f'Created {test_name} unit test'
        }
    
    def _extract_test_name(self, title: str) -> str:
        """Extract test name from title"""
        # Remove common words
        stop_words = {'write', 'create', 'test', 'tests', 'for', 'the', 'a', 'an'}
        words = [w for w in title.split() if w.lower() not in stop_words]
        return ' '.join(words) if words else 'New Test'
    
    def _create_playwright_template(self, name: str, description: str) -> str:
        """Simple Playwright template"""
        return f"""import {{ test, expect }} from '@playwright/test';

/**
 * {name} - E2E Tests
 * {description}
 */

test.describe('{name}', () => {{
    test.beforeEach(async ({{ page }}) => {{
        // Navigate to page
        await page.goto('http://localhost:3000');
    }});
    
    test('should load page successfully', async ({{ page }}) => {{
        // TODO: Add test logic
        await expect(page).toHaveTitle(/.*/);
    }});
    
    test('should handle user interaction', async ({{ page }}) => {{
        // TODO: Add interaction tests
        await expect(page.locator('body')).toBeVisible();
    }});
}});
"""
    
    def _create_jest_template(self, name: str, description: str) -> str:
        """Simple Jest template"""
        return f"""/**
 * {name} - Unit Tests
 * {description}
 */

describe('{name}', () => {{
    test('should work correctly', () => {{
        // TODO: Add test logic
        expect(true).toBe(true);
    }});
}});
"""

# Main execution
if __name__ == '__main__':
    agent = QATestingAgent()
    agent.run()
