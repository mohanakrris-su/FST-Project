import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi, tokenStorage } from "../api/client";
import SectionCard from "../components/SectionCard";
import StatusPill from "../components/StatusPill";
import SummaryCard from "../components/SummaryCard";

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

function formatMinutes(value) {
  return typeof value === "number" ? `${value} min` : "-";
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [queues, setQueues] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [queuePrediction, setQueuePrediction] = useState(null);
  const [appointmentPrediction, setAppointmentPrediction] = useState(null);
  const [selectedQueueId, setSelectedQueueId] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState("");
  const [manualAverageMinutes, setManualAverageMinutes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function safeLoad(task) {
    try {
      await task();
    } catch (err) {
      if (err.message.includes("expired") || err.message.includes("required")) {
        tokenStorage.clear();
        navigate("/auth", { replace: true });
        return;
      }

      setError(err.message);
    }
  }

  async function loadDashboard() {
    setLoading(true);
    setError("");

    await safeLoad(async () => {
      const [adminData, overviewData, queueData] = await Promise.all([
        adminApi.me(),
        adminApi.getOverview(),
        adminApi.getQueues()
      ]);

      setAdmin(adminData.admin);
      setOverview(overviewData);
      setQueues(queueData.queues);

      if (queueData.queues.length) {
        setSelectedQueueId((current) => current || queueData.queues[0].id);
      } else {
        setSelectedQueueId("");
      }
    });

    setLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (!selectedQueueId) {
      setAppointments([]);
      setQueuePrediction(null);
      return;
    }

    safeLoad(async () => {
      const [appointmentsData, queuePredictionData] = await Promise.all([
        adminApi.getAppointments({ queueId: selectedQueueId }),
        adminApi.getQueuePrediction(selectedQueueId, manualAverageMinutes || undefined)
      ]);

      setAppointments(appointmentsData.appointments);
      setQueuePrediction(queuePredictionData);

      if (appointmentsData.appointments.length) {
        setSelectedAppointmentId((current) => current || appointmentsData.appointments[0]._id);
      } else {
        setSelectedAppointmentId("");
      }
    });
  }, [selectedQueueId, manualAverageMinutes]);

  useEffect(() => {
    if (!selectedAppointmentId) {
      setAppointmentPrediction(null);
      return;
    }

    safeLoad(async () => {
      const appointmentPredictionData = await adminApi.getAppointmentPrediction(
        selectedAppointmentId,
        manualAverageMinutes || undefined
      );
      setAppointmentPrediction(appointmentPredictionData);
    });
  }, [selectedAppointmentId, manualAverageMinutes]);

  const summaryCards = useMemo(() => {
    if (!overview) {
      return [];
    }

    return [
      {
        label: "Appointments Today",
        value: overview.summary.totalAppointments,
        caption: "Total bookings on the current queue date"
      },
      {
        label: "Waiting Patients",
        value: overview.summary.waitingCount,
        caption: "Current patients still in the waiting line"
      },
      {
        label: "Completed Consultations",
        value: overview.summary.completedCount,
        caption: "Patients already finished for the day"
      },
      {
        label: "Average Consultation",
        value: `${overview.summary.averageConsultationMinutes} min`,
        caption: "Observed or doctor-default consultation average"
      },
      {
        label: "Revenue Snapshot",
        value: `Rs. ${overview.summary.revenueToday}`,
        caption: "Payment amount across today's appointments"
      },
      {
        label: "Paused Queues",
        value: overview.summary.pausedQueues,
        caption: "Queues requiring admin attention"
      }
    ];
  }, [overview]);

  async function handleLogout() {
    try {
      await adminApi.logout();
    } catch (err) {
      // Ignore logout errors and clear the client token anyway.
    }

    tokenStorage.clear();
    navigate("/auth", { replace: true });
  }

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Admin Command Center</p>
          <h1>Smart Care Q Analytics Console</h1>
          <p className="dashboard-subtitle">
            {admin ? `Signed in as ${admin.name}` : "Loading admin profile..."}
          </p>
        </div>
        <div className="dashboard-header__actions">
          <button className="ghost-button" onClick={loadDashboard}>
            Refresh Data
          </button>
          <button className="primary-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {error ? <div className="page-error">{error}</div> : null}
      {loading ? <div className="page-loading">Loading admin analytics...</div> : null}

      {!loading && overview ? (
        <>
          <section className="summary-grid">
            {summaryCards.map((card) => (
              <SummaryCard
                key={card.label}
                label={card.label}
                value={card.value}
                caption={card.caption}
              />
            ))}
          </section>

          <div className="dashboard-layout">
            <SectionCard
              title="Operational Alerts"
              subtitle="Quick queue-health warnings generated from today's live numbers."
            >
              {overview.alerts.length ? (
                <div className="alert-list">
                  {overview.alerts.map((alert, index) => (
                    <article key={`${alert.type}-${index}`} className={`alert alert--${alert.severity}`}>
                      <strong>{alert.type.replace("_", " ")}</strong>
                      <p>{alert.message}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No operational alerts right now.</p>
              )}
            </SectionCard>

            <SectionCard
              title="Queue AI Prediction"
              subtitle="Inspect expected consultation time using observed averages or an admin override."
              actions={
                <div className="control-group">
                  <input
                    type="number"
                    min="3"
                    placeholder="Manual avg min"
                    value={manualAverageMinutes}
                    onChange={(event) => setManualAverageMinutes(event.target.value)}
                  />
                  <select
                    value={selectedQueueId}
                    onChange={(event) => setSelectedQueueId(event.target.value)}
                  >
                    <option value="">Select Queue</option>
                    {queues.map((queue) => (
                      <option key={queue.id} value={queue.id}>
                        {queue.doctor?.name || "Unknown Doctor"} - {queue.status}
                      </option>
                    ))}
                  </select>
                </div>
              }
            >
              {queuePrediction ? (
                <>
                  <div className="inline-metrics">
                    <div>
                      <span>Doctor</span>
                      <strong>{queuePrediction.doctor.name}</strong>
                    </div>
                    <div>
                      <span>Department</span>
                      <strong>{queuePrediction.doctor.departmentName}</strong>
                    </div>
                    <div>
                      <span>Average</span>
                      <strong>{queuePrediction.averageConsultationMinutes} min</strong>
                    </div>
                    <div>
                      <span>Confidence</span>
                      <strong>{Math.round(queuePrediction.confidence * 100)}%</strong>
                    </div>
                  </div>

                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Token</th>
                          <th>Patient</th>
                          <th>Status</th>
                          <th>Patients Ahead</th>
                          <th>Predicted Wait</th>
                          <th>Expected Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {queuePrediction.predictions.map((item) => (
                          <tr key={item.appointmentId}>
                            <td>{item.tokenNumber}</td>
                            <td>{item.patientName}</td>
                            <td>
                              <StatusPill value={item.status} />
                            </td>
                            <td>{item.patientsAhead ?? "-"}</td>
                            <td>{formatMinutes(item.predictedWaitMinutes)}</td>
                            <td>{formatDateTime(item.expectedConsultationTime)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="empty-state">Choose a queue to view predicted consultation times.</p>
              )}
            </SectionCard>

            <SectionCard
              title="Appointment Prediction Detail"
              subtitle="Save an expected consultation time for one selected appointment."
              actions={
                <select
                  value={selectedAppointmentId}
                  onChange={(event) => setSelectedAppointmentId(event.target.value)}
                >
                  <option value="">Select Appointment</option>
                  {appointments.map((appointment) => (
                    <option key={appointment._id} value={appointment._id}>
                      Token {appointment.tokenNumber} - {appointment.patientName}
                    </option>
                  ))}
                </select>
              }
            >
              {appointmentPrediction?.prediction ? (
                <div className="detail-grid">
                  <div className="detail-card">
                    <span>Patient</span>
                    <strong>{appointmentPrediction.appointment.patientName}</strong>
                  </div>
                  <div className="detail-card">
                    <span>Predicted Wait</span>
                    <strong>{formatMinutes(appointmentPrediction.prediction.predictedWaitMinutes)}</strong>
                  </div>
                  <div className="detail-card">
                    <span>Expected Consultation</span>
                    <strong>
                      {formatDateTime(
                        appointmentPrediction.prediction.expectedConsultationTime
                      )}
                    </strong>
                  </div>
                  <div className="detail-card">
                    <span>Prediction Confidence</span>
                    <strong>
                      {Math.round(
                        appointmentPrediction.queuePredictionMeta.confidence * 100
                      )}
                      %
                    </strong>
                  </div>
                </div>
              ) : (
                <p className="empty-state">
                  Choose an appointment from the selected queue to inspect its predicted time.
                </p>
              )}
            </SectionCard>

            <SectionCard
              title="Doctor Analytics"
              subtitle="Admin view of queue pressure, daily load, and consultation speed."
            >
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Seen Today</th>
                      <th>Waiting</th>
                      <th>Avg Consult</th>
                      <th>Projected Backlog</th>
                      <th>Fill Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.doctorPerformance.map((row) => (
                      <tr key={row.doctorId}>
                        <td>{row.doctorName}</td>
                        <td>{row.departmentName}</td>
                        <td>
                          <StatusPill value={row.status} />
                        </td>
                        <td>{row.patientsSeenToday}</td>
                        <td>{row.waitingCount}</td>
                        <td>{row.averageConsultationMinutes} min</td>
                        <td>{row.projectedBacklogMinutes} min</td>
                        <td>{row.fillRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard
              title="Department Flow"
              subtitle="Hospital-wide department movement for the selected day."
            >
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Doctors Active</th>
                      <th>Booked</th>
                      <th>Completed</th>
                      <th>Waiting</th>
                      <th>Skipped</th>
                      <th>Avg Wait</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.departmentFlow.map((row) => (
                      <tr key={row.departmentName}>
                        <td>{row.departmentName}</td>
                        <td>{row.doctorsActive}</td>
                        <td>{row.appointmentsBooked}</td>
                        <td>{row.completed}</td>
                        <td>{row.waiting}</td>
                        <td>{row.skipped}</td>
                        <td>{row.averagePredictedWaitMinutes} min</td>
                        <td>Rs. {row.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        </>
      ) : null}
    </main>
  );
}
