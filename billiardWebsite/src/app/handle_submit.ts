
import { checkIfUserExists, addUser, getUser } from '@/actions/actions';
const handle_submit = async (username: string, password:string) => {
    // TODO: Add registration logic here
    if (!username || !password) {
        console.log('Please enter a username and password');
    } else {
        const userExists = await checkIfUserExists(username);

        if (userExists) {
            console.log('User already exists');
        } else {
            // Add the user
            await addUser(username, password);
            console.log('User registered successfully');

            //Redirect to main page but with user id
            const user_id = await getUser(username);
        }
    }
};

export default handle_submit;