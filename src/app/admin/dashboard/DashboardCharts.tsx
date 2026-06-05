'use client'

import dynamic from 'next/dynamic'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import type { RevenuePoint } from './RevenueChart'
import type { ShiftsPoint } from './ShiftsChart'
import type { StatusSlice } from './StatusDonut'

const RevenueChart = dynamic(() => import('./RevenueChart'), { ssr: false })
const ShiftsChart  = dynamic(() => import('./ShiftsChart'),  { ssr: false })
const StatusDonut  = dynamic(() => import('./StatusDonut'),  { ssr: false })

type Props = {
  monthlyData: (RevenuePoint & ShiftsPoint)[]
  statusData: StatusSlice[]
}

export default function DashboardCharts({ monthlyData, statusData }: Props) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-semibold text-text">Omzet & kost per maand</h2>
          </CardHeader>
          <CardBody>
            <RevenueChart data={monthlyData} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-text">Status verdeling (12 mnd)</h2>
          </CardHeader>
          <CardBody>
            <StatusDonut data={statusData} />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-text">Shifts per maand</h2>
        </CardHeader>
        <CardBody>
          <ShiftsChart data={monthlyData} />
        </CardBody>
      </Card>
    </>
  )
}
