import { Page } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';
import { Role, User } from '../src/service/pizzaService';
import { register } from 'node:module';




test('home page', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');
});

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = { 'playwriter@jwt.com': { id: '3', name: 'Kai Chen', email: 'playwriter@jwt.com', password: 'a', roles: [{ role: Role.Diner }] },
                                              'a@jwt.com': { id: '10', name: 'Joe Danger', email: 'a@jwt.com', password: 'admin', roles: [{ role: Role.Admin }] }
                                            };

  // Authorize login/register for the given user
  await page.route('*/**/api/auth', async (route) => {
    const method = route.request().method();

    if (method === "PUT") { // Login
        const loginReq = route.request().postDataJSON();
        const user = validUsers[loginReq.email];
        if (!user || user.password !== loginReq.password) {
            await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
            return;
        }
        loggedInUser = validUsers[loginReq.email];
        const loginRes = {
            user: loggedInUser,
            token: 'abcdef',
        };
        expect(route.request().method()).toBe('PUT');
        await route.fulfill({ json: loginRes });
    } else if (method === "POST") { //Register
        const registerReq = route.request().postDataJSON();
        if (!register.name || !registerReq.email || !registerReq.password) {
            await route.fulfill({status: 400, json: {message: 'name, email, and password are required'}})
        }
        const registerRes = {
            user: {
                name: registerReq.name,
                email: registerReq.email,
                roles: [
                    {
                        role: "diner"
                    }
                ],
                id: 3
            },
            token: 'abcdf'
        }
        expect(route.request().method()).toBe('POST');
        await route.fulfill({ json: registerRes });
    }
  });

  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  // A standard menu
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      {
        id: 1,
        title: 'Veggie',
        image: 'pizza1.png',
        price: 0.0038,
        description: 'A garden of delight',
      },
      {
        id: 2,
        title: 'Pepperoni',
        image: 'pizza2.png',
        price: 0.0042,
        description: 'Spicy treat',
      },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  // Standard franchises and stores
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      const franchiseRes = {
        franchises: [
          {
            id: 2,
            name: 'LotaPizza',
            stores: [
              { id: 4, name: 'Lehi' },
              { id: 5, name: 'Springville' },
              { id: 6, name: 'American Fork' },
            ],
          },
          { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
          { id: 4, name: 'topSpot', stores: [] },
        ],
      };
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: franchiseRes });
    } else if (method === 'POST') {
      const franchiseReq = route.request().postDataJSON();
      const franchiseRes = {
        stores: franchiseReq.stores,
        id: 50, 
        name: "Playwright Pizza Joint Test",
        admins: [
          {
            email: "playwriter@jwt.com",
            id: 2,
            name: "Kai Chen"
          }
        ]
      };
      expect(route.request().method()).toBe('POST');
      route.fulfill({ json: franchiseRes });
    }
  });

  // Order a pizza or get orders.
  await page.route('*/**/api/order', async (route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const orderReq = route.request().postDataJSON();
      const orderRes = {
        order: { ...orderReq, id: 23 },
        jwt: 'eyJpYXQ',
      };
      expect(route.request().method()).toBe('POST');
      await route.fulfill({ json: orderRes });
    } else if (method === 'GET') {
      const orderRes = {
        dinerId: 2,
        orders: [],
        page: 1
      }
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: orderRes });
    }
    
  });

  await page.goto('/');
}

test('register', async ({ page }) => {
    await basicInit(page);

    await page.goto('http://localhost:5173/');
    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByRole('textbox', { name: 'Full name' }).fill('test guy');
    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('testing@test.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('test');
    await expect(page.getByRole('heading')).toContainText('Welcome to the party');
    await page.getByText('Already have an account?').click();
    await expect(page.locator('form')).toContainText('Already have an account? Login instead.');
    await expect(page.getByRole('list')).toContainText('register');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page.getByRole('link', { name: 'tg' })).toBeVisible();
    await expect(page.locator('#navbar-dark')).toContainText('Logout');
});

test('view diner dashboard', async ({ page }) => {
  await basicInit(page);
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('playwriter@jwt.com');
  await page.getByText('Email addressPasswordLoginAre').click();
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'KC' }).click();
  await expect(page.getByRole('heading')).toContainText('Your pizza kitchen');
  await expect(page.getByRole('main')).toContainText('name: Kai Chenemail: playwriter@jwt.comrole: dinerHow have you lived this long without having a pizza? Buy one now!');
  await expect(page.getByRole('img', { name: 'Employee stock photo' })).toBeVisible();
  await expect(page.getByRole('list')).toContainText('diner-dashboard');
});

test('view about', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await expect(page.getByRole('contentinfo')).toContainText('About');
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page.getByRole('list')).toContainText('about');
    await expect(page.getByRole('main')).toContainText('The secret sauce');
    await expect(page.getByRole('main')).toContainText('At JWT Pizza, our amazing employees are the secret behind our delicious pizzas. They are passionate about their craft and spend every waking moment dreaming about how to make our pizzas even better. From selecting the finest ingredients to perfecting the dough and sauce recipes, our employees go above and beyond to ensure the highest quality and taste in every bite. Their dedication and attention to detail make all the difference in creating a truly exceptional pizza experience for our customers. We take pride in our team and their commitment to delivering the best pizza in town.');
    await expect(page.getByRole('main')).toContainText('Our talented employees at JWT Pizza are true artisans. They pour their heart and soul into every pizza they create, striving for perfection in every aspect. From hand-stretching the dough to carefully layering the toppings, they take pride in their work and are constantly seeking ways to elevate the pizza-making process. Their creativity and expertise shine through in every slice, resulting in a pizza that is not only delicious but also a work of art. We are grateful for our dedicated team and their unwavering commitment to delivering the most flavorful and satisfying pizzas to our valued customers.');
    await expect(page.getByRole('main')).toContainText('Our employees');
    await expect(page.getByRole('main')).toContainText('JWT Pizza is home to a team of pizza enthusiasts who are truly passionate about their craft. They are constantly experimenting with new flavors, techniques, and ingredients to push the boundaries of traditional pizza-making. Their relentless pursuit of perfection is evident in every bite, as they strive to create a pizza experience that is unparalleled. Our employees understand that the secret to a great pizza lies in the details, and they leave no stone unturned in their quest for pizza perfection. We are proud to have such dedicated individuals on our team, as they are the driving force behind our reputation for exceptional quality and taste.');
    await expect(page.getByRole('main')).toContainText('At JWT Pizza, our employees are more than just pizza makers. They are culinary artists who are deeply passionate about their craft. They approach each pizza with creativity, precision, and a genuine love for what they do. From experimenting with unique flavor combinations to perfecting the cooking process, our employees are constantly pushing the boundaries of what a pizza can be. Their dedication and expertise result in pizzas that are not only delicious but also a reflection of their passion and commitment. We are grateful for our talented team and the incredible pizzas they create day in and day out.');
    await expect(page.getByRole('img', { name: 'Employee stock photo' }).nth(3)).toBeVisible();
    await expect(page.getByRole('img').nth(3)).toBeVisible();
});

test('view history', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await expect(page.getByRole('contentinfo')).toContainText('History');
    await page.getByRole('link', { name: 'History' }).click();
    await expect(page.getByRole('heading')).toContainText('Mama Rucci, my my');
    await expect(page.getByRole('list')).toContainText('history');
    await expect(page.getByRole('main')).toContainText('It all started in Mama Ricci\'s kitchen. She would delight all of the cousins with a hot pie in any style they could think of Milanese, Chicago deep dish, Detroit square pan, Neapolitan, or even fusion flatbread.Pizza has a long and rich history that dates back thousands of years. Its origins can be traced back to ancient civilizations such as the Egyptians, Greeks, and Romans. The ancient Egyptians were known to bake flatbreads topped with various ingredients, similar to modern-day pizza. In ancient Greece, they had a dish called "plakous" which consisted of flatbread topped with olive oil, herbs, and cheese.However, it was the Romans who truly popularized pizza-like dishes. They would top their flatbreads with various ingredients such as cheese, honey, and bay leaves.Fast forward to the 18th century in Naples, Italy, where the modern pizza as we know it today was born. Neapolitan pizza was typically topped with tomatoes, mozzarella cheese, and basil. It quickly became a favorite among the working class due to its affordability and delicious taste. In the late 19th century, pizza made its way to the United States through Italian immigrants.It gained popularity in cities like New York and Chicago, where pizzerias started popping up. Today, pizza is enjoyed worldwide and comes in countless variations and flavors. However, the classic Neapolitan pizza is still a favorite among many pizza enthusiasts. This is especially true if it comes from JWT Pizza!');
    await expect(page.getByRole('main').getByRole('img')).toBeVisible();
});

test('diner franchiseDashboard', async ({ page }) => {
    await basicInit(page);

    await page.goto('http://localhost:5173/');
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('playwriter@jwt.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('a');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.locator('#navbar-dark')).toContainText('Franchise');
    await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
    await expect(page.getByRole('main')).toContainText('So you want a piece of the pie?');
    await expect(page.getByRole('list')).toContainText('franchise-dashboard');
    await expect(page.getByRole('alert')).toContainText('If you are already a franchisee, pleaseloginusing your franchise account');
    await expect(page.getByRole('main')).toContainText('Call now800-555-5555');
    await expect(page.getByRole('main')).toContainText('Now is the time to get in on the JWT Pizza tsunami. The pizza sells itself. People cannot get enough. Setup your shop and let the pizza fly. Here are all the reasons why you should buy a franchise with JWT Pizza.');
    await expect(page.getByRole('main')).toContainText('Owning a franchise with JWT Pizza can be highly profitable. With our proven business model and strong brand recognition, you can expect to generate significant revenue. Our profit forecasts show consistent growth year after year, making it a lucrative investment opportunity.');
    await expect(page.getByRole('main')).toContainText('In addition to financial success, owning a franchise also allows you to make a positive impact on your community. By providing delicious pizzas and creating job opportunities, you contribute to the local economy and bring joy to people\'s lives. It\'s a rewarding experience that combines entrepreneurship with social responsibility. The following table shows a possible stream of income from your franchise.');
    await expect(page.getByRole('main')).toContainText('But it\'s not just about the money. By becoming a franchise owner, you become part of a community that is passionate about delivering exceptional pizzas and creating memorable experiences. You\'ll have the chance to build a team of dedicated employees who share your vision and work together to achieve greatness. And as your business grows, so does your impact on the local economy, creating jobs and bringing joy to countless pizza lovers.');
    await expect(page.getByRole('main').locator('img')).toBeVisible();
    await expect(page.locator('thead')).toContainText('Year');
    await expect(page.locator('thead')).toContainText('Profit');
    await expect(page.locator('thead')).toContainText('Costs');
    await expect(page.locator('thead')).toContainText('Franchise Fee');
    await expect(page.getByRole('cell', { name: '2020' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '₿' }).first()).toBeVisible();
    await expect(page.getByRole('main')).toContainText('Unleash Your Potential');
    await expect(page.getByRole('main')).toContainText('Are you ready to embark on a journey towards unimaginable wealth? Owning a franchise with JWT Pizza is your ticket to financial success. With our proven business model and strong brand recognition, you have the opportunity to generate substantial revenue. Imagine the thrill of watching your profits soar year after year, as customers flock to your JWT Pizza, craving our mouthwatering creations.');
    
});

test('admin dashboard', async ({ page }) => {
  await basicInit(page);
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Admin');
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('list')).toContainText('admin-dashboard');
  await expect(page.locator('h3')).toContainText('Franchises');
  await expect(page.locator('h2')).toContainText('Mama Ricci\'s kitchen');
  await expect(page.locator('thead')).toContainText('Franchise');
  await expect(page.locator('thead')).toContainText('Franchisee');
  await expect(page.locator('thead')).toContainText('Store');
  await expect(page.locator('thead')).toContainText('Revenue');
  await expect(page.locator('thead')).toContainText('Action');
  await expect(page.getByRole('table')).toContainText('Close');
  await expect(page.getByRole('textbox', { name: 'Filter franchises' })).toBeVisible();
  await expect(page.locator('tfoot')).toContainText('Submit');
  await expect(page.getByRole('button', { name: '»' })).toBeVisible();
  await expect(page.getByRole('button', { name: '«' })).toBeVisible();
  await expect(page.getByRole('main')).toContainText('Add Franchise');
});

async function createFranchise(page: Page) {
  await basicInit(page);
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).fill('Playwright Pizza Joint Test');
  await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
  await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('playwriter@jwt.com');
}

test('create franchise', async ({ page }) => {
  await basicInit(page);
  await createFranchise(page);
  await expect(page.getByRole('list')).toContainText('create-franchise');
  await expect(page.getByRole('listitem').filter({ hasText: 'create-franchise' }).getByRole('img')).toBeVisible();
  await expect(page.getByRole('heading')).toContainText('Create franchise');
  await expect(page.locator('form')).toContainText('Want to create franchise?');
  await expect(page.locator('form')).toContainText('Create');
  await expect(page.locator('form')).toContainText('Cancel');
  await expect(page.getByRole('textbox', { name: 'franchise name' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'franchisee admin email' })).toBeVisible();
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('main')).toContainText('Add Franchise');
});

test('close franchise', async ({ page }) => {
  await basicInit(page);
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByRole('row', { name: 'LotaPizza' }).getByRole('button').click();
  await expect(page.getByRole('heading')).toContainText('Sorry to see you go');
  await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
  await expect(page.getByRole('main')).toContainText('Close');
  await expect(page.getByRole('main')).toContainText('Cancel');
  await expect(page.getByRole('list')).toContainText('close-franchise');
  await page.getByRole('button', { name: 'Close' }).click();
});


test('create store', async ({ page }) => {
  await basicInit(page);
  await page.route(/\/api\/franchise\/\d+$/, async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      const franchiseRes = [
        {
          id: 501,
          name: "Playwright Pizza Joint",
          admins: [
            {
              id: 3,
              name: "Kai Chen",
              email: "playwriter@jwt.com"
            }
          ],
          stores: []
        }
      ]
      route.fulfill({ json: franchiseRes });
    }
  });

  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('playwriter@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Franchise');
  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
  await expect(page.getByRole('list')).toContainText('franchise-dashboard');
  await expect(page.getByRole('heading')).toContainText('Playwright Pizza Joint');
  await expect(page.getByRole('main')).toContainText('Everything you need to run an JWT Pizza franchise. Your gateway to success.');
  await expect(page.locator('thead')).toContainText('Name');
  await expect(page.locator('thead')).toContainText('Revenue');
  await expect(page.locator('thead')).toContainText('Action');
  await expect(page.getByRole('button', { name: 'Create store' })).toBeVisible();
  await page.getByRole('button', { name: 'Create store' }).click();
  await expect(page.getByRole('heading')).toContainText('Create store');
  await expect(page.getByRole('list')).toContainText('create-store');
  await expect(page.getByRole('button', { name: 'Create' })).toBeVisible();
  await expect(page.locator('form')).toContainText('Create');
  await expect(page.locator('form')).toContainText('Cancel');
  await page.getByRole('textbox', { name: 'store name' }).click();
  await page.getByRole('textbox', { name: 'store name' }).fill('My Favorite Store');
  await page.getByRole('button', { name: 'Create' }).click();
});

test('login', async ({ page }) => {
  await basicInit(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('playwriter@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
});

test('logout', async ({ page }) => {
  await basicInit(page);
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('playwriter@jwt.com');
  await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('textbox', { name: 'Password' }).press('Tab');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByLabel('Global')).toContainText('KC');
  await expect(page.locator('#navbar-dark')).toContainText('Logout');
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Login');
  await expect(page.locator('#navbar-dark')).toContainText('Register');
});

test('purchase with login', async ({ page }) => {
  await basicInit(page);

  // Go to order page
  await page.getByRole('button', { name: 'Order now' }).click();

  // Create order
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();

  // Login
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('playwriter@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  // Pay
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Check balance
  await expect(page.getByText('0.008')).toBeVisible();
});