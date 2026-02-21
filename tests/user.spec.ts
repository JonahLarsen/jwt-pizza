import { test, expect } from 'playwright-test-coverage';
import { basicInit } from './testUtils';
import { Role } from '../src/service/pizzaService';

test('updateUser', async ({ page }) => {
  await basicInit(page);
  const email = 'updater@jwt.com';
  // await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('Bob Smith');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'bs' }).click();

  await expect(page.getByRole('main')).toContainText('Bob Smith');

  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.getByRole('textbox').first().fill('pizza dinerx');
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

  await expect(page.getByRole('main')).toContainText('pizza dinerx');

  await page.getByRole('link', { name: 'Logout' }).click();

  await page.route('*/**/api/auth', async (route) => {
    const loginReq = route.request().postDataJSON();
    let loggedInUser = { id: '3', name: 'pizza dinerx', email: 'updater@jwt.com', password: 'diner', roles: [{ role: Role.Diner }] }
    const loginRes = {
        user: loggedInUser,
        token: 'abcdef',
    };
    expect(route.request().method()).toBe('PUT');
    await route.fulfill({ json: loginRes });
  });

  await page.getByRole('link', { name: 'Login' }).click();

  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.getByRole('link', { name: 'pd' }).click();

  await expect(page.getByRole('main')).toContainText('pizza dinerx');
});

test('updateUserChangeEmail', async ({ page }) => {
  await basicInit(page);
  const email = 'updater@jwt.com';
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('Bob Smith');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('diner');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'bs' }).click();

  await expect(page.getByRole('main')).toContainText('Bob Smith');

  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('newEmailer@jwt.com');
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

  await expect(page.getByRole('main')).toContainText('newEmailer@jwt.com');
});

test('updateUserAsAdmin', async ({ page }) => {
  await basicInit(page);
  const email = 'a@jwt.com';
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('Joe Danger');
  await page.getByRole('textbox', { name: 'Email address' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Register' }).click();

  await page.getByRole('link', { name: 'jd' }).click();

  await expect(page.getByRole('main')).toContainText('Joe Danger');

  await page.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('h3')).toContainText('Edit user');
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('newEmailer@jwt.com');
  await page.getByRole('button', { name: 'Update' }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });

  await expect(page.getByRole('main')).toContainText('newEmailer@jwt.com');
});

test('listUsers', async ({ page }) => {
  await basicInit(page);
  // await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.locator('[id="users-heading"]')).toContainText('Users');
  await expect(page.locator('#users-header')).toContainText('Name');
  await expect(page.locator('#users-header')).toContainText('Email');
  await expect(page.locator('#users-header')).toContainText('Role');
  await expect(page.locator('#users-header')).toContainText('Action');
  await expect(page.locator('#users-table')).toContainText('Joe Danger');
  await expect(page.locator('#users-table')).toContainText('a@jwt.com');
  await expect(page.locator('#users-table')).toContainText('admin');
  await expect(page.locator('#users-table')).toContainText('Delete');
  await expect(page.locator('#users-tfoot')).toContainText('Submit');
  await expect(page.getByRole('textbox', { name: 'Filter users' })).toBeVisible();
  await expect(page.locator('#users-tfoot').getByRole('button', { name: '»' })).toBeVisible();
  await expect(page.locator('#users-tfoot')).toContainText('»');
});

test('deleteUser', async ({ page }) => {
  await basicInit(page);
  await page.route(/\/api\/user\/\d+/, async (route) => {
    const method = route.request().method();
    if (method === 'DELETE') {
      const deleteRes = {
        message: "user deleted"
      }
      await route.fulfill({ json: deleteRes });
    }
  });
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('testfordelete');
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('testfordelete@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('test');
  await page.getByRole('button', { name: 'Register' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.route(/\/api\/user(\?.*)?$/, async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      const userRes = {
        users: [
          {
            id: 2,
            name: "testfordelete",
            email: "testfordelete@jwt.com",
            roles: [
              {role: "diner"}
            ]
          }
        ]
      }
      await route.fulfill({ json: userRes });
    }
  });
  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByRole('textbox', { name: 'Filter users' }).click();
  await page.getByRole('textbox', { name: 'Filter users' }).fill('testfordel');
  await page.locator('#users-tfoot').getByRole('button', { name: 'Submit' }).click();
  await expect(page.locator('#users-table')).toContainText('testfordelete');
  await page.locator('#users-table').getByRole('button', { name: 'Delete' }).click();
  await expect(page.locator('#users-header')).toContainText('Name');
})