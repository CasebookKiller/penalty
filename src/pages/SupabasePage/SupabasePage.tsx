import { createContext, FC, useContext, useEffect, useState } from 'react';
import './SupabasePage.css';

import Supabase from '../../supabaseClient';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

import { Panel } from 'primereact/panel';

const SBaseContext = createContext(Supabase);

/**
 * Запись в таблице ids
 */
interface TGRec {
  created_at: string;
  id: number;
  tgid: string;
}

export const SupabasePage: FC = () => {
  const SBase = useContext(SBaseContext); 
  const [ids, setIds] = useState<TGRec[]>([]);

  async function getIds() {
    const result: PostgrestSingleResponse<TGRec[]> = await SBase
      .from("ids")
      .select()
      .lt("id", 10); //первые 10 записей

    console.log('%cids: %o', `color: firebrick; background-color: white`, result.data);  
    
    setIds(result.data||[]);
  }

  useEffect(() => {
    getIds();
  }, []);
  
  function rectifyFormat(s: string) {
    const b = s.split(/\D/);
    return b[0] + '-' + b[1] + '-' + b[2] + 'T' +
           b[3] + ':' + b[4] + ':' + b[5] + '.' +
           b[6].substring(0,3) + '+00:00';
  }

  return (
    <>
      <SBaseContext.Provider value={Supabase}>
        <div className="SupabasePage">
          <Panel
            className='shadow-5 mx-1 mt-1 mb-2'
            header={'Пользователи'}
            footer={'В базе данных содержатся сведения об идентификаторах пользователей Telegram'}
          >
            {ids.map((id) => (
              <div
                key={id.id} 
                className='flex flex-wrap align-items-center gap-4 app p-2'
              >
                <div className='flex-1 flex flex-column gap-1 xl:mr-8'>
                  <span
                    className='app font-size-subheading'
                  >
                    {id.id} - {id.tgid}
                  </span>
                  <div className='flex align-items-center gap-2'>
                    <span
                      className='app font-size theme-hint-color font-weight-content nowrap overflow-ellipsis'
                    >
                      {new Date(rectifyFormat(id.created_at)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </Panel>
        </div>
      </SBaseContext.Provider>
    </>
  );
};
