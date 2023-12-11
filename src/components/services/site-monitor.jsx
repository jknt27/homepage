import { useTranslation } from "react-i18next";
import useSWR from "swr";

function dothecker(styleDotChecker, backgroundClass, colorClass) {
  let newcolorClass = colorClass;
  let newBackgroundClass = backgroundClass;
  if (styleDotChecker) {
    newBackgroundClass = "p-4";
    newcolorClass = colorClass.replace(/text-/g, "bg-").replace(/\/\d\d/g, "");
  }
  return { newBackgroundClass, newcolorClass };
}

function handleErrorCase(
  translation,
  originalStatusTitle,
  styleDotChecker,
  backgroundClass,
  statusErrorMessage,
  originalColorClass,
  originalStatusText,
) {
  let statusTitle = originalStatusTitle;
  let statusText = originalStatusText;
  let colorClass = originalColorClass;
  colorClass = "text-rose-500";
  statusText = translation(statusErrorMessage);
  statusTitle += ` ${translation(statusErrorMessage)}`;
  const dotheckerresult = dothecker(styleDotChecker, backgroundClass, colorClass);
  const newBackgroundClass = dotheckerresult.backgroundClass;
  colorClass = dotheckerresult.colorClass;
  return { colorClass, newBackgroundClass, statusTitle, statusText };
}

function nodata(
  translation,
  styleDotChecker,
  originalStatusTitle,
  originalColorClass,
  originalStatusText,
  originalBackgroundClass,
) {
  let backgroundClass = originalBackgroundClass;
  let statusTitle = originalStatusTitle;
  let statusText = originalStatusText;
  let colorClass = originalColorClass;
  statusText = translation("siteMonitor.response");
  statusTitle += ` ${translation("siteMonitor.not_available")}`;
  const dotheckerresult = dothecker(styleDotChecker, backgroundClass, colorClass);
  backgroundClass = dotheckerresult.backgroundClass;
  colorClass = dotheckerresult.colorClass;
  return { colorClass, backgroundClass, statusTitle, statusText };
}
function dataerror(
  originalStatusTitle,
  styleBasicChecker,
  translation,
  originalBackgroundClass,
  styleDotChecker,
  originalColorClass,
  originalStatusText,
  data,
) {
  let colorClass = originalColorClass;
  let statusTitle = originalStatusTitle;
  let statusText = originalStatusText;
  let backgroundClass = originalBackgroundClass;
  colorClass = "text-rose-500/80";
  statusTitle += ` ${data.status}`;
  if (styleBasicChecker) {
    statusText = translation("siteMonitor.down");
  } else {
    statusText = data.status;
  }
  const dotheckerresult = dothecker(styleDotChecker, backgroundClass, colorClass);
  backgroundClass = dotheckerresult.backgroundClass;
  colorClass = dotheckerresult.colorClass;
  return { colorClass, backgroundClass, statusTitle, statusText };
}

function handleData(
  originalBackgroundClass,
  originalStatusTitle,
  styleBasicChecker,
  styleDotChecker,
  data,
  originalColorClass,
  originalStatusText,
  translation,
) {
  let colorClass = originalColorClass;
  let statusTitle = originalStatusTitle;
  let statusText = originalStatusText;
  let backgroundClass = originalBackgroundClass;
  colorClass = "text-emerald-500/80";
  const responseTime = translation("common.ms", {
    value: data.latency,
    style: "unit",
    unit: "millisecond",
    maximumFractionDigits: 0,
  });
  statusTitle += ` ${data.status} (${responseTime})`;
  if (styleBasicChecker) {
    statusText = translation("siteMonitor.up");
  } else {
    statusText = responseTime;
    colorClass += " lowercase";
  }
  const dotheckerresult = dothecker(styleDotChecker, backgroundClass, colorClass);
  backgroundClass = dotheckerresult.backgroundClass;
  colorClass = dotheckerresult.colorClass;
  return { colorClass, backgroundClass, statusTitle, statusText };
}

function getSiteMonitorStatus(error, data, translation, style) {
  const FORBIDDEN_STATUS_CODE = 403;
  const colorClass = "text-black/20 dark:text-white/40 opacity-20";
  const backgroundClass = "bg-theme-500/10 dark:bg-theme-900/50 px-1.5 py-0.5";
  const statusTitle = translation("siteMonitor.http_status");
  const statusErrorMessage = "siteMonitor.error";
  const dataErrorStatus = data.status > FORBIDDEN_STATUS_CODE;
  const styleBasicChecker = style === "basic";
  const styleDotChecker = style === "dot";
  const statusText = "";
  if (error) {
    handleErrorCase(
      statusText,
      translation,
      statusTitle,
      statusErrorMessage,
      styleDotChecker,
      backgroundClass,
      colorClass,
    );
  } else if (!data) {
    nodata(statusText, translation, styleDotChecker, statusTitle, colorClass, backgroundClass);
  } else if (dataErrorStatus) {
    dataerror(
      statusText,
      statusTitle,
      styleBasicChecker,
      translation,
      backgroundClass,
      styleDotChecker,
      data,
      colorClass,
    );
  } else if (data) {
    handleData(statusText, backgroundClass, statusTitle, translation, styleBasicChecker, styleDotChecker, colorClass);
  }
}

export default function SiteMonitor({ group, service, style }) {
  const { translation } = useTranslation();
  const { data, error } = useSWR(`/api/siteMonitor?${new URLSearchParams({ group, service }).toString()}`, {
    refreshInterval: 30000,
  });
  const { colorClass, backgroundClass, statusTitle, statusText } = getSiteMonitorStatus(
    error,
    data,
    translation,
    style,
  );
  return (
    <div
      className={`w-auto text-center rounded-b-[3px] overflow-hidden site-monitor-status ${backgroundClass}`}
      title={statusTitle}
    >
      {style !== "dot" && <div className={`font-bold uppercase text-[8px] ${colorClass}`}>{statusText}</div>}
      {style === "dot" && <div className={`rounded-full h-3 w-3 ${colorClass}`} />}
    </div>
  );
}
