import { AppNavigation } from '../AppNavigator';

const router = AppNavigation.router;
const mainNavAction = router.getActionForPathAndParams('Launcher');
const initialNavState = router.getStateForAction(mainNavAction);

const NavReducer = (state = initialNavState, action) => {
    return router.getStateForAction(action, state);
};

export default NavReducer;