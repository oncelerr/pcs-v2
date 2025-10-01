type StageItem = {
  name: string;
  status: string; // "completed" | "active" | "pending"
};

type Stage = {
  name: string;
  status: string; // derived from items
  items: StageItem[];
};

export const getStatusProgress = async (): Promise<{
  stages: Stage[];
  percentage: number;
}> => {
  const token = localStorage.getItem('auth_token');

  const response = await fetch('/api/progress', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include', // 👈 send cookies for Google login sessions
  });

  if (!response.ok) {
    if (response.status === 401) {
      // User is not logged in; clear local token and redirect
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      return { stages: [], percentage: 0 };
    }

    const err = await response.text();
    throw new Error(`Error fetching progress: ${err}`);
  }

  const data = await response.json();
  let stages: Stage[] = data.stages;

  // 🔹 Derive stage status from items
  stages = stages.map((stage) => {
    const items = stage.items;
    let status: "completed" | "active" | "pending" = "pending";

    if (items.every((i) => i.status === "completed")) {
      status = "completed";
    } else if (items.some((i) => i.status === "active")) {
      status = "active";
    } else {
      status = "pending";
    }

    return { ...stage, status };
  });

  // 🔹 Compute percentage
  const setup = stages.find((s) => s.name === 'Setup')?.status;
  const compliance = stages.find((s) => s.name === 'Compliance')?.status;
  const finalization = stages.find((s) => s.name === 'Finalization')?.status;

  let percentage = 0;

  if (setup === 'active' && compliance === 'pending' && finalization === 'pending') {
    percentage = 16.7;
  } else if (setup === 'completed' && compliance === 'active' && finalization === 'pending') {
    percentage = 50.0;
  } else if (setup === 'completed' && compliance === 'completed' && finalization === 'active') {
    percentage = 83.7;
  } else if (setup === 'completed' && compliance === 'completed' && finalization === 'completed') {
    percentage = 100.0;
  }

  return { stages, percentage };
};

