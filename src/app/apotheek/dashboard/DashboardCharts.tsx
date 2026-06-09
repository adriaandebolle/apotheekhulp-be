'use client'

import dynamic from 'next/dynamic'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import type { ShiftsPoint } from '@/app/admin/dashboard/ShiftsChart'
import type { StatusSlice } from '@/app/admin/dashboard/StatusDonut'
import type { HoursPoint } from '@/components/charts/HoursChart'

const ShiftsChart = dynamic(() => import('@/app/admin/dashboard/ShiftsChart'), { ssr: false })
const StatusDonut = dynamic(() => import('@/app/admin/dashboard/StatusDonut'), { ssr: false })
const HoursChart  = dynamic(() => import('@/components/charts/HoursChart'),    { ssr: false })

type Props = {
  monthlyData: (ShiftsPoint & HoursPoint)[]
  statusData: StatusSlice[]
}

export default function ApotheekDashboardCharts({ monthlyData, statusData }: Props) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="font-semibold text-text">Uren per maand (goedgekeurd)</h2>
          </CardHeader>
          <CardBody>
            <HoursChart data={monthlyData} />
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
