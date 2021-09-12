import { User } from "@src/models/user"

describe('Users functional tests', () => {

    beforeEach(async() => {
        await User.deleteMany({});
    })

    describe('When creating a new user', () => {
        it('shluld successfully create a new user', async() => {
            const newUser = {
                name: 'John Doe',
                email: "john@mail.com",
                password: "1234"
            };

            const response = await global.testRequest.post('/user').send(newUser);
            expect(response.status).toBe(201);
            expect(response.body).toEqual(expect.objectContaining(newUser));
        })        
    })
})