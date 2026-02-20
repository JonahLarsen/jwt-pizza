import { test, expect } from 'playwright-test-coverage';
import { basicInit } from './testUtils';
import { Role } from '../src/service/pizzaService';

test('updateUser', async ({ page }) => {
  basicInit(page);
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
  basicInit(page);
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
  basicInit(page);
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