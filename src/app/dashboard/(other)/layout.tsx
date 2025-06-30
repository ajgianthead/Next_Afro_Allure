import LayoutComp from "./layoutcomp";

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Dashboard | AfroAllure',
};

export default function Layout({ children }: any) {
    return <><LayoutComp children={children} />
    </>
}
