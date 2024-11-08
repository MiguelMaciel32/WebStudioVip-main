import { ResponsiveLine } from '@nivo/line';
import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';

interface SalesChartProps {
  className?: string;
}

interface SalesData {
  id: string;
  data: { x: string; y: number }[];
}

export default function SalesChart({ className }: SalesChartProps) {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const token_empresa = sessionStorage.getItem('token_empresa');
        if (!token_empresa) {
          toast({ title: 'Você precisa estar logado para acessar os dados.' });
          return;
        }

        const response = await fetch('/api/DASHBOARDTEMPOREAL', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token_empresa}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}), 
        });

      
        console.log('Resposta da requisição:', response);

        const data = await response.json();

        if (response.ok) {

          const monthlyCounts = countAgendamentosPorMes(data.data);
          
          setSalesData(monthlyCounts);
        } else {
      
        }
      } catch (error) {
        console.error('Erro ao buscar dados de vendas:', error);

      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();


    const interval = setInterval(fetchSalesData, 100000); 
    return () => clearInterval(interval);
    
  }, []);

  const countAgendamentosPorMes = (data: { agendamento_id: number; data_hora: string }[]) => {
    const monthlyCount: { [key: string]: number } = {};
    
    const monthNames: string[] = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    data.forEach(item => {
      const date = new Date(item.data_hora);
      const month = date.getUTCMonth(); 
      const year = date.getUTCFullYear(); 

      const monthYearKey = `${monthNames[month]} ${year}`; 
      if (!monthlyCount[monthYearKey]) {
        monthlyCount[monthYearKey] = 0;
      }

      monthlyCount[monthYearKey]++; 
    });


    const allMonths = monthNames.map((month: string, index: number) => {
      const monthYearKey = `${month} ${new Date().getUTCFullYear()}`; 
      return {
        monthYearKey,
        count: monthlyCount[monthYearKey] || 0 
      };
    });


    const formattedData = allMonths.map(month => ({
      x: month.monthYearKey,
      y: month.count,
    }));


    return [
      {
        id: 'Agendamentos',
        data: formattedData,
      },
    ];
  };

  if (loading) {
    return <p>Carregando dados de vendas...</p>;
  }

  return (
    <div className={className}>
      <ResponsiveLine
        data={salesData.length ? salesData : [{
          id: "Sem dados",
          data: [{ x: "Nenhum", y: 0 }]
        }]}
        margin={{ top: 10, right: 10, bottom: 40, left: 40 }}
        xScale={{ type: "point" }}
        yScale={{ type: "linear", min: 0, max: "auto" }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 0,
          tickPadding: 16,
        }}
        axisLeft={{
          tickSize: 0,
          tickValues: 5,
          tickPadding: 16,
        }}
        colors={["#2563eb", "#e11d48"]}
        pointSize={6}
        useMesh={true}
        curve="monotoneX"
        enableArea={true}
        gridYValues={6}
        defs={[
          {
            id: "line-chart-gradient",
            type: "linearGradient",
            colors: [
              { offset: 0, color: "inherit" },
              { offset: 200, color: "inherit", opacity: 0 },
            ],
          },
        ]}
        fill={[{ match: "*", id: "line-chart-gradient" }]}
        theme={{
          tooltip: {
            chip: { borderRadius: "9999px" },
            container: {
              fontSize: "12px",
              textTransform: "capitalize",
              borderRadius: "6px",
            },
          },
          grid: {
            line: { stroke: "#f3f4f6" },
          },
        }}
        role="application"
      />
    </div>
  );
}
