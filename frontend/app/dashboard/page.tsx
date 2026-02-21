export default function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-8 text-gray-800">
        Dashboard
      </h2>

      <div className="grid grid-cols-4 gap-6">

        <div className="bg-blue-500 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-sm">Citas Hoy</h3>
          <p className="text-3xl font-bold mt-2">5</p>
        </div>

        <div className="bg-green-500 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-sm">Pacientes Activos</h3>
          <p className="text-3xl font-bold mt-2">120</p>
        </div>

        <div className="bg-red-500 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-sm">Tratamientos</h3>
          <p className="text-3xl font-bold mt-2">8</p>
        </div>

        <div className="bg-purple-500 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-sm">Pendientes de Pago</h3>
          <p className="text-3xl font-bold mt-2">3</p>
        </div>

      </div>

      <div className="mt-10 grid grid-cols-2 gap-6">

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Agenda de Hoy</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>10:00 - Ana Gómez</li>
            <li>11:00 - Carlos Ruiz</li>
            <li>15:00 - María Torres</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Estadísticas</h3>
          <div className="h-40 flex items-center justify-center text-gray-400">
            Gráfico próximamente
          </div>
        </div>

      </div>
    </div>
  );
}
