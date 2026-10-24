// Entry point. Modules only declare things at load time; their start-up code
// lives in install(), which runs here in a fixed order: later modules extend
// what earlier ones set up (shapes, menus, renderers), so the order matters.

import { install as installCoreCore } from './core/core';
import { install as installDiagramsCatalog } from './diagrams/catalog';
import { install as installDiagramsTechLogos } from './diagrams/tech-logos';
import { install as installCoreUi } from './core/ui';
import { install as installCoreFeatures } from './core/features';
import { install as installDiagramsFrameworks } from './diagrams/frameworks';
import { install as installEditorInspector } from './editor/inspector';
import { install as installEditorWorkspaces } from './editor/workspaces';
import { install as installAiProviders } from './ai/providers';
import { install as installAiLlmStatus } from './ai/llm-status';
import { install as installEditorSimulate } from './editor/simulate';
import { install as installDiagramsShapesPlus } from './diagrams/shapes-plus';
import { install as installDiagramsBusiness } from './diagrams/business';
import { install as installProjectsProjects } from './projects/projects';
import { install as installEditorNavigation } from './editor/navigation';
import { install as installSlidesDeck } from './slides/deck';
import { install as installI18nId } from './i18n/id';
import { install as installEditorCanvasFont } from './editor/canvas-font';
import { install as installLinesLabels } from './lines/labels';
import { install as installLinesToolbar } from './lines/toolbar';
import { install as installLinesSnap } from './lines/snap';
import { install as installDiagramsUmlExtra } from './diagrams/uml-extra';
import { install as installGuideGoals } from './guide/goals';
import { install as installAiIntent } from './ai/intent';
import { install as installEditorTheme } from './editor/theme';
import { install as installAiFab } from './ai/fab';
import { install as installLinesRouter } from './lines/router';
import { install as installLinesWaypoints } from './lines/waypoints';
import { install as installProjectsFolder } from './projects/folder';
import { install as installCoreBoot } from './core/boot';

const INSTALL_ORDER: Array<() => void> = [
  installCoreCore,
  installDiagramsCatalog,
  installDiagramsTechLogos,
  installCoreUi,
  installCoreFeatures,
  installDiagramsFrameworks,
  installEditorInspector,
  installEditorWorkspaces,
  installAiProviders,
  installAiLlmStatus,
  installEditorSimulate,
  installDiagramsShapesPlus,
  installDiagramsBusiness,
  installProjectsProjects,
  installEditorNavigation,
  installSlidesDeck,
  installI18nId,
  installEditorCanvasFont,
  installLinesLabels,
  installLinesToolbar,
  installLinesSnap,
  installDiagramsUmlExtra,
  installGuideGoals,
  installAiIntent,
  installEditorTheme,
  installAiFab,
  installLinesRouter,
  installLinesWaypoints,
  installProjectsFolder,
  installCoreBoot,
];

export function start(): void {
  for (const install of INSTALL_ORDER) install();
}
