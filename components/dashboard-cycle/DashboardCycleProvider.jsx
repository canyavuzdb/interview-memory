'use client'

import { createContext, useContext, useEffect, useState } from 'react'

const DashboardCycleContext = createContext(0)
const DASHBOARD_CYCLE_DURATION = 10_000

export function DashboardCycleProvider({ children }) {
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCycle((current) => current + 1)
    }, DASHBOARD_CYCLE_DURATION)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <DashboardCycleContext.Provider value={cycle}>
      {children}
    </DashboardCycleContext.Provider>
  )
}

export function useDashboardCycle() {
  return useContext(DashboardCycleContext)
}
