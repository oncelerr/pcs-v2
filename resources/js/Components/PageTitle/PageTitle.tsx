import { useEffect } from 'react';

interface PageTitleProps {
    title: string;
    children?: React.ReactNode;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, children }) => {
    useEffect(() => {
        document.title = title ? `${title} | PCS` : 'Premium Corp Solutions';
    }, [title]);

    return <>{children}</>;
};

export default PageTitle;
