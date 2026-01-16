# Learning notes

## JWT Pizza code study and debugging

As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity                                       | Frontend component | Backend endpoints | Database SQL |
| --------------------------------------------------- | ------------------ | ----------------- | ------------ |
| View home page                                      |        home.jsx            |   none        |      none        |
| Register new user<br/>(t@jwt.com, pw: test)         | register.jsx  | [POST]<br/>/api/auth |  `INSERT INTO user (name, email, password) VALUES (?, ?, ?)`<br/>`INSERT INTO userRole (userId, role, objectId) VALUES (?, ?, ?)`<br/>`INSERT INTO auth (token, userId) VALUES (?, ?) ON DUPLICATE KEY UPDATE token=token` |
| Login new user<br/>(t@jwt.com, pw: test)            |   login.tsx    |  [PUT]<br/>/api/auth     |  `SELECT * FROM user WHERE email=?`<br/>`SELECT * FROM userRole WHERE userId=?`<br/>`INSERT INTO auth (token, userId) VALUES (?, ?) ON DUPLICATE KEY UPDATE token=token`  |
| Order pizza                                         |  menu.tsx<br/>payment.tsx  | [POST]<br/>/api/order | `INSERT INTO dinerOrder (dinerId, franchiseId, storeId, date) VALUES (?, ?, ?, now())`<br/>`INSERT INTO orderItem (orderId, menuId, description, price) VALUES (?, ?, ?, ?)` |
| Verify pizza                                        |  delivery.tsx  | none(goes to factory) |    none(goes to factory) |
| View profile page                                   |   dinerDashboard.tsx   |  [GET]<br/>/api/order  | `SELECT id, franchiseId, storeId, date FROM dinerOrder WHERE dinerId=? LIMIT ${offset},${config.db.listPerPage}`<br/>`SELECT id, menuId, description, price FROM orderItem WHERE orderId=?` |
| View franchise<br/>(as diner)                       |  franchiseDashboard.tsx | [GET]<br/>/api/franchise/:userId | `SELECT objectId FROM userRole WHERE role='franchisee' AND userId=?` |
| Logout                                              |  logout.tsx | [DELETE]<br/>/api/auth | `DELETE FROM auth WHERE token=?` |
| View About page                                     | about.tsx | none | none |
| View History page                                   | history.tsx | none | none |
| Login as franchisee<br/>(f@jwt.com, pw: franchisee) |                    |                   |              |
| View franchise<br/>(as franchisee)                  |                    |                   |              |
| Create a store                                      |                    |                   |              |
| Close a store                                       |                    |                   |              |
| Login as admin<br/>(a@jwt.com, pw: admin)           |                    |                   |              |
| View Admin page                                     |                    |                   |              |
| Create a franchise for t@jwt.com                    |                    |                   |              |
| Close the franchise for t@jwt.com                   |                    |                   |              |
