export const useNavigate = jest.fn()
export const useLocation = jest.fn(() => ({ pathname: '/' }))
export const BrowserRouter = ({ children }: { children: React.ReactNode }) => children
export const Routes = ({ children }: { children: React.ReactNode }) => children
export const Route = () => null
export const Link = ({ children }: { children: React.ReactNode }) => children
export const NavLink = ({ children }: { children: React.ReactNode }) => children
export const Navigate = () => null
export const Outlet = () => null
