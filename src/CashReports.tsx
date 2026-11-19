import { useMemo } from "react";
import { Box, Heading, Progress, SimpleGrid, Text } from "@chakra-ui/react";
import {
  brl,
  CASH_CATEGORIES,
  cashBalance,
  monthLabel,
  monthOf,
  type CashCategory,
  type CashExpense,
  type CashInflow,
} from "./types";

interface Props {
  inflows: CashInflow[];
  spending: CashExpense[];
}

const Card = ({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) => (
  <Box bg="surface" borderWidth="1px" borderColor="line" borderRadius="20px" p={{ base: 4, md: 5 }}>
    <Heading size="md" mb={1}>{title}</Heading>
    {subtitle && <Text color="muted" fontSize="sm" mb={4}>{subtitle}</Text>}
    {children}
  </Box>
);

const shortMonth = (ym: string) => `${ym.slice(5)}/${ym.slice(2, 4)}`;

function BalanceChart({ points }: { points: { month: string; balance: number }[] }) {
  const W = 600;
  const H = 220;
  const pad = { l: 12, r: 12, t: 16, b: 30 };
  const values = points.map((p) => p.balance);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const span = max - min || 1;
  const x = (i: number) =>
    points.length === 1 ? W / 2 : pad.l + (i * (W - pad.l - pad.r)) / (points.length - 1);
  const y = (v: number) => pad.t + ((max - v) * (H - pad.t - pad.b)) / span;
  const step = Math.ceil(points.length / 6);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Histórico do saldo do caixa">
      <line x1={pad.l} x2={W - pad.r} y1={y(0)} y2={y(0)} stroke="var(--chakra-colors-line)" strokeDasharray="4 4" />
      <polyline
        fill="none"
        stroke="var(--chakra-colors-ocean-400)"
        strokeWidth="3"
        strokeLinejoin="round"
        points={points.map((p, i) => `${x(i)},${y(p.balance)}`).join(" ")}
      />
      {points.map((p, i) => (
        <g key={p.month}>
          <circle cx={x(i)} cy={y(p.balance)} r="4.5" fill="var(--chakra-colors-ocean-400)">
            <title>{`${monthLabel(p.month)}: ${brl(p.balance)}`}</title>
          </circle>
          {(i % step === 0 || i === points.length - 1) && (
            <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="12" fill="var(--chakra-colors-muted)">
              {shortMonth(p.month)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export default function CashReports({ inflows, spending }: Props) {
  const data = useMemo(() => {
    const revenue: Record<string, number> = {};
    const spent: Record<string, number> = {};
    inflows.forEach((i) => {
      const m = monthOf(i.date);
      revenue[m] = (revenue[m] ?? 0) + i.amount;
    });
    spending.forEach((e) => {
      const m = monthOf(e.date);
      spent[m] = (spent[m] ?? 0) + e.amount;
    });
    const months = [...new Set([...Object.keys(revenue), ...Object.keys(spent)])].sort();
    let running = 0;
    const history = months.map((month) => {
      running += (revenue[month] ?? 0) - (spent[month] ?? 0);
      return { month, balance: running };
    });
    const byCategory = (Object.keys(CASH_CATEGORIES) as CashCategory[]).map((key) => ({
      key,
      total: spending.filter((e) => e.category === key).reduce((a, e) => a + e.amount, 0),
    }));
    return { revenue, months, history, byCategory };
  }, [inflows, spending]);

  const totalRevenue = inflows.reduce((a, i) => a + i.amount, 0);
  const totalSpent = spending.reduce((a, e) => a + e.amount, 0);
  const maxRevenue = Math.max(0, ...Object.values(data.revenue));

  return (
    <Box display="flex" flexDirection="column" gap={5}>
      <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3}>
        {[
          ["Entradas no caixa", brl(totalRevenue)],
          ["Gastos do caixa", brl(totalSpent)],
          ["Saldo atual", brl(cashBalance(inflows, spending))],
        ].map(([label, value]) => (
          <Box key={label} bg="surface" borderWidth="1px" borderColor="line" borderRadius="18px" p={4}>
            <Text color="muted" fontSize="sm">{label}</Text>
            <Heading size="md" mt={1}>{value}</Heading>
          </Box>
        ))}
      </SimpleGrid>

      <Card title="Histórico do saldo" subtitle="Saldo acumulado do caixa ao fim de cada mês.">
        {data.history.length === 0 ? <Text color="muted">Sem dados.</Text> : <BalanceChart points={data.history} />}
      </Card>

      <Card title="Entradas por mês" subtitle="Locações (no mês da entrada), aportes e lançamentos da categoria Caixa.">
        {data.months.length === 0 && <Text color="muted">Sem dados.</Text>}
        <Box display="flex" flexDirection="column" gap={4}>
          {data.months.map((m) => {
            const v = data.revenue[m] ?? 0;
            return (
              <Box key={m}>
                <Box display="flex" justifyContent="space-between" flexWrap="wrap" columnGap={3} mb={1}>
                  <Text fontWeight="600">{monthLabel(m)}</Text>
                  <Text>{brl(v)}</Text>
                </Box>
                <Progress value={maxRevenue ? (v / maxRevenue) * 100 : 0} colorScheme="cyanSea" bg="sunken" borderRadius="full" h="8px" />
              </Box>
            );
          })}
        </Box>
      </Card>

      <Card title="Gastos por categoria" subtitle="Para onde o dinheiro do caixa está indo.">
        <Box display="flex" flexDirection="column" gap={4}>
          {data.byCategory.map(({ key, total }) => (
            <Box key={key}>
              <Box display="flex" justifyContent="space-between" flexWrap="wrap" columnGap={3} mb={1}>
                <Text fontWeight="600">{CASH_CATEGORIES[key].label}</Text>
                <Text>
                  {brl(total)}{" "}
                  <Text as="span" color="muted" fontSize="sm">
                    ({totalSpent ? Math.round((total / totalSpent) * 100) : 0}%)
                  </Text>
                </Text>
              </Box>
              <Progress
                value={totalSpent ? (total / totalSpent) * 100 : 0}
                colorScheme={CASH_CATEGORIES[key].color}
                bg="sunken"
                borderRadius="full"
                h="8px"
              />
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
}
