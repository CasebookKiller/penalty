import { ReactNode } from 'react';
export const PrimeReactFlex = ({ children }: { children: ReactNode }) => {
  return (
    <div className="p-inputgroup flex-1">
      {children}
    </div>
  )
}