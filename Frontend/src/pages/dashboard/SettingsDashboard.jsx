import CacheManager from "../../components/CacheManager";

const SettingsDashboard = () => {
  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <div>
        <p className="hifi-eyebrow">Settings</p>
        <h1
          className="text-2xl"
          style={{ fontFamily: "var(--font-display)", color: "var(--cream)" }}
        >
          Player Settings
        </h1>
      </div>

      <CacheManager />
    </div>
  );
};

export default SettingsDashboard;
