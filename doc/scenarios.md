### Scenario 1: Admin Creates a Community Manager

1. **Admin Login**

   - **Endpoint:** `POST /api/login`
   - **Body:** `{email: "martin.lero@edu.ecole-89.com", password: "ADMINADMIN"}`
   - **Return:**`OTP`

2. **Admin Verify OTP**

- **Endpoint:** `POST /api/verify_otp`
- **Body:** `{ otp: "", id: "1" }`
- **Return:**`Token`

3. **Admin Creates a Community Manager (CM)**

   - **Endpoint:** `POST /api/user/`
   - **Body:** `
{
   "createUser" : {
      "email": "alyxisss@gmail.com",
      "first_name": "martin",
      "last_name": "leroy",
      "password": "EMPLOYEEEMPLOYEE"
   },
   "roles": [4, 5]
}`

4. **Admin Get all Users (Employees)**

   - **Endpoint:** `GET /api/user/`

### Scenario 2: Employee creates an Event

1. **CM Login**

   - **Endpoint:** `POST /api/login`
   - **Body:** `{email: "alyxisss@gmail.com", password: "EMPLOYEEEMPLOYEE"}`

2. **CM Verify OTP**

   - **Endpoint:** `POST /api/verify_otp`
   - **Body:** `{ otp: "", id: "5" }`

3. **CM Creates an Event**

   - **Endpoint:** `POST /api/event`
   - **Body:** `{ title: "title 3", desc: "title 3 description", date: "2026-02-13T01:25:25.000Z", image: "image.com",}`

4. **CM Views All Events**
   - **Endpoint:** `GET /api/event`

> **Note:** Don't forget the token/OTP. The exact fields to be filled in the body are not complete.
