import LayoutComp from "./layoutcomp";

export const metadata = {
    title: 'Dashboard | AfroAllure',
};

export default function Layout({ children }: any) {
    return <><LayoutComp children={children} />
    </>
}
