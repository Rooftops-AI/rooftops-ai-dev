"use client"

import { useState } from "react"
import {
  IconHome,
  IconRuler,
  IconSun,
  IconCurrencyDollar,
  IconChevronDown,
  IconChevronUp,
  IconDownload,
  IconShare
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface PropertyReportData {
  status: string
  address: string
  property?: {
    address: string
    type: string
    groundArea?: number
  }
  roof?: {
    totalArea: number
    totalSquares?: number
    facetCount: number
    mainPitch: string
    facets?: Array<{
      area: number
      pitch: string
      orientation: string
    }>
  }
  solar?: {
    maxPanels: number
    yearlyEnergyKwh: number
    suitability?: string
    installationCost: number
    netSavings20Years: number
    paybackYears?: number
  }
  imageryQuality?: string
  markdownReport?: string
}

interface AgentPropertyReportCardProps {
  data: PropertyReportData
}

export function AgentPropertyReportCard({
  data
}: AgentPropertyReportCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "roof" | "solar">(
    "overview"
  )

  if (data.status !== "success" || !data.roof) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(Math.round(num))
  }

  const getSuitabilityColor = (suitability?: string) => {
    switch (suitability) {
      case "Great Fit":
        return "text-green-400 border-green-500/30 bg-gradient-to-br from-green-500/20 to-emerald-500/20"
      case "Good Fit":
        return "text-blue-400 border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-blue-600/20"
      default:
        return "text-muted-foreground border-blue-500/15 bg-gradient-to-br from-blue-500/10 to-purple-500/10"
    }
  }

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-blue-500/15 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-sm shadow-blue-500/10">
            <IconHome className="size-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-foreground font-semibold">Property Report</h3>
            <p className="text-muted-foreground text-sm font-light">
              {data.address}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data.solar?.suitability && (
            <span
              className={cn(
                "rounded-xl border px-3 py-1 text-xs font-medium shadow-sm",
                getSuitabilityColor(data.solar.suitability)
              )}
            >
              {data.solar.suitability}
            </span>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 divide-x divide-blue-500/15 border-b border-blue-500/15">
        <StatItem
          icon={IconRuler}
          label="Roof Area"
          value={`${formatNumber(data.roof.totalArea)} sq ft`}
        />
        <StatItem
          icon={IconHome}
          label="Facets"
          value={data.roof.facetCount.toString()}
        />
        <StatItem
          icon={IconSun}
          label="Solar Panels"
          value={data.solar?.maxPanels?.toString() || "N/A"}
        />
        <StatItem
          icon={IconCurrencyDollar}
          label="20yr Savings"
          value={
            data.solar ? formatCurrency(data.solar.netSavings20Years) : "N/A"
          }
        />
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-b border-blue-500/15">
          {/* Tabs */}
          <div className="flex border-b border-blue-500/15">
            <TabButton
              active={activeTab === "overview"}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </TabButton>
            <TabButton
              active={activeTab === "roof"}
              onClick={() => setActiveTab("roof")}
            >
              Roof Details
            </TabButton>
            <TabButton
              active={activeTab === "solar"}
              onClick={() => setActiveTab("solar")}
            >
              Solar Analysis
            </TabButton>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === "overview" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-blue-500/15 bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-4">
                  <h4 className="text-foreground mb-2 font-medium">Property</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground font-light">Type</dt>
                      <dd className="text-foreground font-light">
                        {data.property?.type || "Residential"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground font-light">
                        Ground Area
                      </dt>
                      <dd className="text-foreground font-light">
                        {data.property?.groundArea
                          ? `${formatNumber(data.property.groundArea)} sq ft`
                          : "N/A"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground font-light">
                        Imagery Quality
                      </dt>
                      <dd className="text-foreground font-light">
                        {data.imageryQuality || "Standard"}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="rounded-xl border border-blue-500/15 bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-4">
                  <h4 className="text-foreground mb-2 font-medium">
                    Roof Summary
                  </h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground font-light">
                        Total Area
                      </dt>
                      <dd className="text-foreground font-light">
                        {formatNumber(data.roof.totalArea)} sq ft
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground font-light">
                        Roofing Squares
                      </dt>
                      <dd className="text-foreground font-light">
                        {data.roof.totalSquares ||
                          Math.ceil(data.roof.totalArea / 100)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground font-light">
                        Main Pitch
                      </dt>
                      <dd className="text-foreground font-light">
                        {data.roof.mainPitch}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {activeTab === "roof" && data.roof.facets && (
              <div>
                <h4 className="text-foreground mb-3 font-medium">
                  Roof Facets
                </h4>
                <div className="overflow-x-auto rounded-xl border border-blue-500/15">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-blue-500/15 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-left">
                        <th className="text-muted-foreground px-4 py-2 font-medium">
                          #
                        </th>
                        <th className="text-muted-foreground px-4 py-2 font-medium">
                          Area
                        </th>
                        <th className="text-muted-foreground px-4 py-2 font-medium">
                          Pitch
                        </th>
                        <th className="text-muted-foreground px-4 py-2 font-medium">
                          Orientation
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-foreground font-light">
                      {data.roof.facets.map((facet, index) => (
                        <tr
                          key={index}
                          className="border-b border-blue-500/10 last:border-0"
                        >
                          <td className="px-4 py-2">{index + 1}</td>
                          <td className="px-4 py-2">
                            {formatNumber(facet.area)} sq ft
                          </td>
                          <td className="px-4 py-2">{facet.pitch}</td>
                          <td className="px-4 py-2">{facet.orientation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "solar" && data.solar && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-blue-500/15 bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-4">
                  <h4 className="text-foreground mb-2 font-medium">
                    Solar Potential
                  </h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground font-light">
                        Max Panels
                      </dt>
                      <dd className="text-foreground font-light">
                        {data.solar.maxPanels}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground font-light">
                        Yearly Production
                      </dt>
                      <dd className="text-foreground font-light">
                        {formatNumber(data.solar.yearlyEnergyKwh)} kWh
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground font-light">
                        Suitability
                      </dt>
                      <dd
                        className={cn(
                          "font-medium",
                          data.solar.suitability === "Great Fit"
                            ? "text-green-400"
                            : "text-blue-400"
                        )}
                      >
                        {data.solar.suitability || "N/A"}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="rounded-xl border border-blue-500/15 bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-4">
                  <h4 className="text-foreground mb-2 font-medium">
                    Financial Analysis
                  </h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground font-light">
                        Installation Cost
                      </dt>
                      <dd className="text-foreground font-light">
                        {formatCurrency(data.solar.installationCost)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground font-light">
                        20-Year Savings
                      </dt>
                      <dd className="font-medium text-green-400">
                        {formatCurrency(data.solar.netSavings20Years)}
                      </dd>
                    </div>
                    {data.solar.paybackYears && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground font-light">
                          Payback Period
                        </dt>
                        <dd className="text-foreground font-light">
                          {data.solar.paybackYears} years
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm font-light transition-colors"
        >
          {isExpanded ? (
            <>
              <IconChevronUp className="size-4" />
              Show less
            </>
          ) : (
            <>
              <IconChevronDown className="size-4" />
              Show details
            </>
          )}
        </button>
        <div className="flex items-center gap-2">
          <button className="text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-xl border border-transparent px-2.5 py-1.5 text-sm font-light transition-all hover:border-blue-500/20 hover:bg-blue-500/10">
            <IconDownload className="size-4" />
            Export
          </button>
          <button className="text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-xl border border-transparent px-2.5 py-1.5 text-sm font-light transition-all hover:border-blue-500/20 hover:bg-blue-500/10">
            <IconShare className="size-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  )
}

function StatItem({
  icon: Icon,
  label,
  value
}: {
  icon: any
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3">
      <Icon className="size-5 text-blue-400" />
      <span className="text-foreground text-lg font-semibold">{value}</span>
      <span className="text-muted-foreground text-xs font-light">{label}</span>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-sm font-light transition-all",
        active
          ? "border-b-2 border-blue-500 text-blue-400"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}
