import { extendObservable } from 'mobx';

class UserStore {
    constructor() {
        extendObservable(this, {
            email: '',
            values: {}
        });
    }
}

export default new UserStore();