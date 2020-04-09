import { extendObservable } from 'mobx';

class UserStore {
    constructor() {
        extendObservable(this, {
            loading: true,
            loggedIn: false,
            email: undefined,
            name: undefined
        });
    }
}

export default new UserStore();