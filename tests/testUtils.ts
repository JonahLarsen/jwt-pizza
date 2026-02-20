import { Page } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';
import { Role, User } from '../src/service/pizzaService';
import { register } from 'node:module';


export async function basicInit(page: Page) {
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

  //Update User
  await page.route(/\/api\/user\/\d+/, async (route) => {
    expect(route.request().method()).toBe('PUT');
    let request = route.request().postDataJSON();
    let updateRes = {
        id: request.id,
        name: "pizza dinerx",
        email: request.email,
        roles: request.roles,
        token: "abcdef"
    }
    await route.fulfill({json: updateRes});
  })

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