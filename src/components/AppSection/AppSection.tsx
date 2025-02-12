import { FC, ReactNode } from "react"

import './AppSection.css'

interface AppSectionProps {
  header?: ReactNode | string;
  subheader?: ReactNode | string;
  body?: ReactNode | string;
  borderBottom?: boolean;
  subheaderNoWrap?: boolean;
}

interface BlockHeaderProps {
  header?: ReactNode | string;
}

interface BlockSubheaderProps {
  header?: ReactNode | string;
}

interface BlockBodyProps {
  body?: ReactNode | string;
}

export const AppSection: FC<AppSectionProps> = ({header, subheader, body, borderBottom, subheaderNoWrap}) => {
  const classBorderBottom = borderBottom ? ' item-border-bottom' : '';
  const classSection = 'flex flex-wrap align-items-center gap-4 app p-2' + classBorderBottom;
  const classContainer = 'flex-1 flex flex-column gap-1 xl:mr-8';
  const classHeader = 'app font-size-subheading';
  const classSubheaderNoWrap = !subheaderNoWrap ? '' : ' nowrap overflow-ellipsis';
  const classSubheader = 'app font-size theme-hint-color font-weight-content' + classSubheaderNoWrap;
  const classBody = 'app theme-text-color';

  const BlockHeader: FC<BlockHeaderProps> = ({header}) => {
    return (
      <div
        className = { classHeader }
      >
        { header }
      </div>
    )
  }

  const BlockSubheader: FC<BlockSubheaderProps> = ({header}) => {
    return (
      <div className='flex align-items-center gap-2'>
        <div
          className={classSubheader}
        >
          { header }
        </div>
      </div>
    );
  }

  const BlockBody: FC<BlockBodyProps> = ({body}) => {
    return (
      <div
        className = { classBody }
      >
        { body }
      </div>
    )
  }
  return (
    <div style={{ width: '100%' }} className={ classSection }>
      <div className={ classContainer }>
        { header && <BlockHeader header={ header }/> }
        { subheader && <BlockSubheader header={ subheader }/> }
        { body && <BlockBody body={ body }/> }
      </div>
    </div>
  ); 
}