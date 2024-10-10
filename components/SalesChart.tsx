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
          body: JSON.stringify({}), // Enviando um corpo vazio
        });

        // Verifica a resposta
        console.log('Resposta da requisição:', response);

        const data = await response.json();

        if (response.ok) {
          // Transformar dados de agendamentos em contagem mensal
          const monthlyCounts = countAgendamentosPorMes(data.data);
          
          // Atualiza o estado com os dados transformados
          setSalesData(monthlyCounts);
        } else {
          toast({ title: data.error || 'Erro ao carregar dados de vendas.' });
        }
      } catch (error) {
        console.error('Erro ao buscar dados de vendas:', error);
        toast({ title: 'Erro ao buscar dados de vendas.' });
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();


    const interval = setInterval(fetchSalesData, 1); 
    return () => clearInterval(interval);
  }, []);

  // Função para contar agendamentos por mês
  const countAgendamentosPorMes = (data: { agendamento_id: number; data_hora: string }[]) => {
    const monthlyCount: { [key: string]: number } = {};
    
    // Definição dos nomes dos meses
    const monthNames: string[] = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    data.forEach(item => {
      const date = new Date(item.data_hora);
      const month = date.getUTCMonth(); // Mês em formato 0-11
      const year = date.getUTCFullYear(); // Ano

      const monthYearKey = `${monthNames[month]} ${year}`; // Ex: "Outubro 2024"

      // Inicializa a contagem se ainda não existir
      if (!monthlyCount[monthYearKey]) {
        monthlyCount[monthYearKey] = 0;
      }

      monthlyCount[monthYearKey]++; // Incrementa a contagem
    });

    // Adiciona meses sem dados como zero
    const allMonths = monthNames.map((month: string, index: number) => {
      const monthYearKey = `${month} ${new Date().getUTCFullYear()}`; // Para o ano atual
      return {
        monthYearKey,
        count: monthlyCount[monthYearKey] || 0 // Define como 0 se não existir
      };
    });

    // Converte o objeto em um formato adequado para o gráfico
    const formattedData = allMonths.map(month => ({
      x: month.monthYearKey,
      y: month.count,
    }));

    // Retorna o formato esperado pelo gráfico
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
