APP_TITLE = "Selenforge Editor"
APP_WIDTH = 1600
APP_HEIGHT = 960
APP_ICON_ICO = "Selenforge.ico"
APP_ENTRY_FILE = "app\\index.html"
SNAPSHOT_PREFIX = "sfa"
PROJECT_FILE_NAME = "project.txt"
PROJECT_INI_NAME = "project.ini"
SCENE_FILE_NAME = "main.scene.txt"
ASSETS_FILE_NAME = "assets.cfg"
SCRIPTS_INDEX_FILE_NAME = "scripts.cfg"
LOG_FILE_NAME = "selenforge.log"

APP_DIR = ""
CURRENT_SNAPSHOT_DIR = ""

function get_app_dir():
    global APP_DIR
    if type(APP_DIR) == "string" and len(trim(APP_DIR)) > 0:
        return APP_DIR
    end

    args = argv()
    if type(args) == "list" and len(args) > 0:
        exe_path = str(args[0])
        if len(trim(exe_path)) > 0:
            APP_DIR = dirname(absolute_path(exe_path))
        end
    end

    if len(trim(APP_DIR)) == 0:
        APP_DIR = getcwd()
    end

    return APP_DIR
end

function to_file_url(path):
    p = replace(absolute_path(path), "\\", "/")
    if len(p) > 1 and substring(p, 1, 1) == ":":
        return "file:///" + p
    end
    return "file://" + p
end

function ensure_dir(path):
    if exists(path):
        return true
    end

    code = shell("mkdir \"" + path + "\" >nul 2>nul")
    return code == 0 or exists(path)
end

function ensure_parent_dir(path):
    return ensure_dir(dirname(path))
end

function read_text(path, fallback):
    if exists(path):
        return read_file(path)
    end
    return fallback
end

function write_text(path, content):
    ensure_parent_dir(path)
    write_file(path, content)
end

function decode_json_value(raw, fallback):
    if type(raw) != "string":
        return fallback
    end

    try:
        return json_decode(raw)
    catch e:
        return fallback
    end
end

function decode_json_dict(raw):
    value = decode_json_value(raw, {})
    if type(value) == "dict":
        return value
    end
    return {}
end

function decode_json_list(raw):
    value = decode_json_value(raw, [])
    if type(value) == "list":
        return value
    end
    return []
end

function unwrap_gui_payload(raw):
    if type(raw) == "list":
        if len(raw) == 0:
            return ""
        end
        return unwrap_gui_payload(raw[0])
    end

    if type(raw) != "string":
        return raw
    end

    try:
        parsed = json_decode(raw)
        if type(parsed) == "list":
            if len(parsed) == 0:
                return ""
            end
            return unwrap_gui_payload(parsed[0])
        end
    catch e:
    end

    return raw
end

function decode_payload_dict(raw):
    unwrapped = unwrap_gui_payload(raw)
    if type(unwrapped) == "dict":
        return unwrapped
    end
    return decode_json_dict(str(unwrapped))
end

function default_brand():
    return {
        "engine": "Selenforge",
        "engineCn": "月铸引擎",
        "renderer": "Moonflare",
        "editor": "StarAnvil",
        "assetExtension": ".sfa",
        "version": "0.1.0"
    }
end

function default_links():
    return {
        "website": "",
        "manual": "",
        "tutorials": "",
        "apiReference": "",
        "forum": "",
        "issues": "",
        "releaseNotes": "",
        "discord": ""
    }
end

function default_script_list():
    return [
        {
            "id": "script-bootstrap",
            "name": "bootstrap.moon",
            "path": "scripts/bootstrap.moon",
            "role": "game",
            "description": "游戏入口脚本",
            "source": "function start():\n    print(\"Selenforge bootstrap start\")\nend\n\nfunction update(dt):\n    return dt\nend\n",
            "compiledJs": ""
        },
        {
            "id": "script-player",
            "name": "player_controller.moon",
            "path": "scripts/player_controller.moon",
            "role": "game",
            "description": "玩家控制示例脚本",
            "source": "function start():\n    print(\"player controller ready\")\nend\n\nfunction update(dt):\n    return dt\nend\n",
            "compiledJs": ""
        }
    ]
end

function default_asset_list():
    return [
        {
            "id": "asset-project-manifest",
            "name": PROJECT_FILE_NAME,
            "type": "项目清单",
            "path": PROJECT_FILE_NAME,
            "description": "完整项目快照"
        },
        {
            "id": "asset-project-config",
            "name": PROJECT_INI_NAME,
            "type": "项目配置",
            "path": PROJECT_INI_NAME,
            "description": "项目基本信息"
        },
        {
            "id": "asset-scene-main",
            "name": SCENE_FILE_NAME,
            "type": "场景",
            "path": join_path("scenes", SCENE_FILE_NAME),
            "description": "当前主场景"
        },
        {
            "id": "asset-assets-index",
            "name": ASSETS_FILE_NAME,
            "type": "资源索引",
            "path": join_path("assets", ASSETS_FILE_NAME),
            "description": "资源列表索引"
        },
        {
            "id": "asset-runtime",
            "name": "moonflare.js",
            "type": "运行时",
            "path": join_path("vendor", "moonflare.js"),
            "description": "Moonflare 渲染运行时"
        },
        {
            "id": "asset-icon",
            "name": "Selenforge.png",
            "type": "图像",
            "path": "Selenforge.png",
            "description": "Selenforge 品牌图标"
        }
    ]
end

function make_script_asset(script):
    file_name = "script.moon"
    file_path = join_path("scripts", file_name)
    if type(script) == "dict":
        if has_key(script, "name"):
            file_name = str(script["name"])
        end
        if has_key(script, "path"):
            file_path = str(script["path"])
        end
    end

    return {
        "id": "asset-" + str(script["id"]),
        "name": file_name,
        "type": "Moon脚本",
        "path": file_path,
        "description": "MoonLang 游戏脚本资源",
        "role": script["role"]
    }
end

function default_project():
    scripts = default_script_list()
    assets = default_asset_list()
    for script in scripts:
        append(assets, make_script_asset(script))
    end

    return {
        "meta": {
            "format": "selenforge-project",
            "version": "0.1.0",
            "updatedAt": str(now())
        },
        "brand": default_brand(),
        "storage": {
            "mode": "sfa-snapshot-dir",
            "slot": "",
            "root": ""
        },
        "scene": {
            "name": "主场景",
            "objects": [
                {
                    "id": "camera-main",
                    "typeId": "perspective",
                    "name": "透视摄像机",
                    "enabled": true,
                    "tags": [],
                    "position": [4.8, 3.2, 7.2],
                    "rotation": [-15, -35, 0],
                    "scale": [1, 1, 1],
                    "components": {}
                },
                {
                    "id": "light-sun",
                    "typeId": "directional-light",
                    "name": "方向光",
                    "enabled": true,
                    "tags": [],
                    "position": [2.8, 4.5, 2.4],
                    "rotation": [45, 35, 0],
                    "scale": [1, 1, 1],
                    "components": {}
                },
                {
                    "id": "ground-plane",
                    "typeId": "plane",
                    "name": "地面",
                    "enabled": true,
                    "tags": [],
                    "position": [0, -0.9, 0],
                    "rotation": [0, 0, 0],
                    "scale": [8, 8, 8],
                    "components": {}
                },
                {
                    "id": "box-core",
                    "typeId": "box",
                    "name": "月铸核心",
                    "enabled": true,
                    "tags": [],
                    "position": [0, 0, 0],
                    "rotation": [0, 32, 0],
                    "scale": [1.4, 1.4, 1.4],
                    "components": {}
                }
            ]
        },
        "scripts": scripts,
        "assets": assets
    }
end

function extract_slot_number(name):
    if type(name) != "string":
        return 0
    end
    if not starts_with(name, "sfa"):
        return 0
    end
    suffix = substring(name, 3, len(name) - 3)
    if len(trim(suffix)) == 0:
        return 0
    end
    i = 0
    while i < len(suffix):
        ch = substring(suffix, i, 1)
        if not is_digit(ch):
            return 0
        end
        i = i + 1
    end
    return int(suffix)
end

function snapshot_name(slot_number):
    return SNAPSHOT_PREFIX + str(slot_number)
end

function get_snapshot_dir(slot_number):
    return join_path(get_app_dir(), snapshot_name(slot_number))
end

function get_project_file(slot_dir):
    return join_path(slot_dir, PROJECT_FILE_NAME)
end

function get_project_ini_file(slot_dir):
    return join_path(slot_dir, PROJECT_INI_NAME)
end

function get_scene_file(slot_dir):
    return join_path(join_path(slot_dir, "scenes"), SCENE_FILE_NAME)
end

function get_assets_file(slot_dir):
    return join_path(join_path(slot_dir, "assets"), ASSETS_FILE_NAME)
end

function get_scripts_index_file(slot_dir):
    return join_path(join_path(slot_dir, "scripts"), SCRIPTS_INDEX_FILE_NAME)
end

function get_runtime_dir(slot_dir):
    return join_path(slot_dir, "runtime")
end

function get_log_file():
    return join_path(get_app_dir(), LOG_FILE_NAME)
end

function append_log(text):
    path = get_log_file()
    old = read_text(path, "")
    write_text(path, old + text)
end

function list_snapshot_numbers():
    numbers = []
    for entry in list_dir(get_app_dir()):
        slot_number = extract_slot_number(entry)
        if slot_number <= 0:
            continue
        end

        full_path = join_path(get_app_dir(), entry)
        if is_dir(full_path):
            append(numbers, slot_number)
        end
    end
    return numbers
end

function latest_snapshot_number():
    latest = 0
    for slot_number in list_snapshot_numbers():
        if slot_number > latest:
            latest = slot_number
        end
    end
    return latest
end

function next_snapshot_number():
    return latest_snapshot_number() + 1
end

function ensure_snapshot_dir(slot_number):
    slot_dir = get_snapshot_dir(slot_number)
    ensure_dir(slot_dir)
    ensure_dir(join_path(slot_dir, "scenes"))
    ensure_dir(join_path(slot_dir, "assets"))
    ensure_dir(join_path(slot_dir, "scripts"))
    ensure_dir(join_path(slot_dir, "runtime"))
    return slot_dir
end

function normalize_script(script, index):
    fallback = {
        "id": "script-" + str(index + 1),
        "name": "script_" + str(index + 1) + ".moon",
        "path": "scripts/script_" + str(index + 1) + ".moon",
        "role": "game",
        "description": "MoonLang 脚本",
        "source": "",
        "compiledJs": ""
    }

    if type(script) != "dict":
        return fallback
    end

    if has_key(script, "id"):
        fallback["id"] = str(script["id"])
    end
    if has_key(script, "name"):
        fallback["name"] = str(script["name"])
    end
    if has_key(script, "path"):
        fallback["path"] = str(script["path"])
    else:
        fallback["path"] = join_path("scripts", fallback["name"])
    end
    if has_key(script, "role"):
        fallback["role"] = str(script["role"])
    end
    if has_key(script, "description"):
        fallback["description"] = str(script["description"])
    end
    if has_key(script, "source"):
        fallback["source"] = str(script["source"])
    end
    if has_key(script, "compiledJs"):
        fallback["compiledJs"] = str(script["compiledJs"])
    end
    return fallback
end

function rebuild_assets(project):
    system_assets = default_asset_list()
    script_assets = []
    if has_key(project, "scripts") and type(project["scripts"]) == "list":
        for script in project["scripts"]:
            append(script_assets, make_script_asset(script))
        end
    end

    user_assets = []
    if has_key(project, "assets") and type(project["assets"]) == "list":
        for asset in project["assets"]:
            if type(asset) != "dict":
                continue
            end
            if has_key(asset, "id"):
                asset_id = str(asset["id"])
                if starts_with(asset_id, "asset-project-") or asset_id == "asset-scene-main" or asset_id == "asset-assets-index" or asset_id == "asset-runtime" or asset_id == "asset-icon" or starts_with(asset_id, "asset-script-") or starts_with(asset_id, "asset-script"):
                    continue
                end
            end
            append(user_assets, asset)
        end
    end

    result = []
    for asset in system_assets:
        append(result, asset)
    end
    for asset in script_assets:
        append(result, asset)
    end
    for asset in user_assets:
        append(result, asset)
    end
    project["assets"] = result
end

function normalize_project(project):
    if type(project) != "dict" or len(project) == 0:
        project = default_project()
    end

    if not has_key(project, "meta") or type(project["meta"]) != "dict":
        project["meta"] = default_project()["meta"]
    end
    if not has_key(project, "brand") or type(project["brand"]) != "dict":
        project["brand"] = default_brand()
    end
    if not has_key(project, "storage") or type(project["storage"]) != "dict":
        project["storage"] = {
            "mode": "sfa-snapshot-dir",
            "slot": "",
            "root": ""
        }
    end
    if not has_key(project, "scene") or type(project["scene"]) != "dict":
        project["scene"] = default_project()["scene"]
    end
    if not has_key(project["scene"], "name"):
        project["scene"]["name"] = "主场景"
    end
    if has_key(project["scene"], "entities") and (not has_key(project["scene"], "objects") or type(project["scene"]["objects"]) != "list"):
        project["scene"]["objects"] = project["scene"]["entities"]
    end
    if not has_key(project["scene"], "objects") or type(project["scene"]["objects"]) != "list":
        project["scene"]["objects"] = default_project()["scene"]["objects"]
    end
    if not has_key(project, "scripts") or type(project["scripts"]) != "list":
        project["scripts"] = default_script_list()
    end

    normalized_scripts = []
    script_index = 0
    for script in project["scripts"]:
        append(normalized_scripts, normalize_script(script, script_index))
        script_index = script_index + 1
    end
    project["scripts"] = normalized_scripts

    if not has_key(project, "assets") or type(project["assets"]) != "list":
        project["assets"] = default_asset_list()
    end

    rebuild_assets(project)

    project["meta"]["format"] = "selenforge-project"
    project["meta"]["updatedAt"] = str(now())
    return project
end

function make_project_ini(project, slot_name, slot_dir):
    scene_name = "主场景"
    object_count = 0
    script_count = 0

    if has_key(project, "scene") and type(project["scene"]) == "dict":
        if has_key(project["scene"], "name"):
            scene_name = str(project["scene"]["name"])
        end
        if has_key(project["scene"], "objects") and type(project["scene"]["objects"]) == "list":
            object_count = len(project["scene"]["objects"])
        end
    end
    if has_key(project, "scripts") and type(project["scripts"]) == "list":
        script_count = len(project["scripts"])
    end

    lines = []
    append(lines, "[project]")
    append(lines, "engine=Selenforge")
    append(lines, "engine_cn=月铸引擎")
    append(lines, "renderer=Moonflare")
    append(lines, "editor=StarAnvil")
    append(lines, "slot=" + slot_name)
    append(lines, "root=" + absolute_path(slot_dir))
    append(lines, "scene_name=" + scene_name)
    append(lines, "object_count=" + str(object_count))
    append(lines, "script_count=" + str(script_count))
    append(lines, "updated_at=" + str(project["meta"]["updatedAt"]))
    append(lines, "")
    append(lines, "[files]")
    append(lines, "project=" + PROJECT_FILE_NAME)
    append(lines, "scene=" + join_path("scenes", SCENE_FILE_NAME))
    append(lines, "assets=" + join_path("assets", ASSETS_FILE_NAME))
    append(lines, "scripts=" + join_path("scripts", SCRIPTS_INDEX_FILE_NAME))
    return join(lines, "\n")
end

function save_snapshot(project, slot_number):
    global CURRENT_SNAPSHOT_DIR

    slot_name = snapshot_name(slot_number)
    slot_dir = ensure_snapshot_dir(slot_number)
    project["storage"]["mode"] = "sfa-snapshot-dir"
    project["storage"]["slot"] = slot_name
    project["storage"]["root"] = absolute_path(slot_dir)
    rebuild_assets(project)

    write_text(get_project_ini_file(slot_dir), make_project_ini(project, slot_name, slot_dir))
    write_text(get_project_file(slot_dir), json_encode(project))
    write_text(get_scene_file(slot_dir), json_encode({
        "meta": {
            "format": "selenforge-scene",
            "version": project["meta"]["version"],
            "updatedAt": project["meta"]["updatedAt"]
        },
        "scene": project["scene"]
    }))
    write_text(get_assets_file(slot_dir), json_encode({
        "meta": {
            "format": "selenforge-assets",
            "version": project["meta"]["version"],
            "updatedAt": project["meta"]["updatedAt"]
        },
        "assets": project["assets"]
    }))
    write_text(get_scripts_index_file(slot_dir), json_encode({
        "meta": {
            "format": "selenforge-scripts",
            "version": project["meta"]["version"],
            "updatedAt": project["meta"]["updatedAt"]
        },
        "scripts": project["scripts"]
    }))

    for script in project["scripts"]:
        script_path = join_path(slot_dir, str(script["path"]))
        write_text(script_path, str(script["source"]))

        compiled_path = join_path(get_runtime_dir(slot_dir), replace(str(script["name"]), ".moon", ".js"))
        compiled_js = ""
        if has_key(script, "compiledJs"):
            compiled_js = str(script["compiledJs"])
        end
        if len(trim(compiled_js)) == 0:
            compiled_js = "// MoonLang script placeholder\n"
        end
        write_text(compiled_path, compiled_js)
    end

    CURRENT_SNAPSHOT_DIR = slot_dir
    append_log("[" + str(now()) + "] save snapshot " + absolute_path(slot_dir) + "\n")
    return slot_dir
end

function read_project_from_snapshot(slot_dir):
    project_path = get_project_file(slot_dir)
    if exists(project_path):
        project = normalize_project(decode_json_dict(read_text(project_path, "{}")))
    else:
        project = default_project()
    end

    scripts_index_path = get_scripts_index_file(slot_dir)
    if exists(scripts_index_path):
        scripts_payload = decode_json_dict(read_text(scripts_index_path, "{}"))
        if has_key(scripts_payload, "scripts") and type(scripts_payload["scripts"]) == "list":
            normalized_scripts = []
            script_index = 0
            for script in scripts_payload["scripts"]:
                normalized = normalize_script(script, script_index)
                script_file = join_path(slot_dir, normalized["path"])
                if exists(script_file):
                    normalized["source"] = read_text(script_file, normalized["source"])
                end
                append(normalized_scripts, normalized)
                script_index = script_index + 1
            end
            project["scripts"] = normalized_scripts
        end
    end

    project["storage"]["mode"] = "sfa-snapshot-dir"
    project["storage"]["slot"] = basename(slot_dir)
    project["storage"]["root"] = absolute_path(slot_dir)
    rebuild_assets(project)
    return project
end

function ensure_default_snapshot():
    latest = latest_snapshot_number()
    if latest > 0:
        return get_snapshot_dir(latest)
    end

    project = default_project()
    slot_dir = save_snapshot(project, 1)
    append_log("[" + str(now()) + "] created default snapshot " + absolute_path(slot_dir) + "\n")
    return slot_dir
end

function active_snapshot_dir():
    global CURRENT_SNAPSHOT_DIR

    if type(CURRENT_SNAPSHOT_DIR) == "string" and len(trim(CURRENT_SNAPSHOT_DIR)) > 0 and exists(CURRENT_SNAPSHOT_DIR):
        return CURRENT_SNAPSHOT_DIR
    end

    CURRENT_SNAPSHOT_DIR = ensure_default_snapshot()
    return CURRENT_SNAPSHOT_DIR
end

function build_paths(slot_dir):
    return {
        "root": absolute_path(get_app_dir()),
        "snapshotDir": absolute_path(slot_dir),
        "snapshotName": basename(slot_dir),
        "projectFile": absolute_path(get_project_file(slot_dir)),
        "projectIniFile": absolute_path(get_project_ini_file(slot_dir)),
        "sceneFile": absolute_path(get_scene_file(slot_dir)),
        "assetFile": absolute_path(get_assets_file(slot_dir)),
        "scriptsFile": absolute_path(get_scripts_index_file(slot_dir)),
        "readmeFile": absolute_path(join_path(get_app_dir(), "README.md")),
        "moonlangDir": absolute_path(join_path(get_app_dir(), "MulanMoonlang"))
    }
end

function cmd_quote(text):
    return "\"" + replace(str(text), "\"", "\"\"") + "\""
end

function safe_file_name(text, fallback):
    value = trim(str(text))
    if len(value) == 0:
        value = fallback
    end
    value = replace(value, " ", "_")
    value = replace(value, "\\", "_")
    value = replace(value, "/", "_")
    value = replace(value, ":", "_")
    value = replace(value, "*", "_")
    value = replace(value, "?", "_")
    value = replace(value, "\"", "_")
    value = replace(value, "<", "_")
    value = replace(value, ">", "_")
    value = replace(value, "|", "_")
    if len(trim(value)) == 0:
        value = fallback
    end
    return value
end

function remove_dir_shell(path):
    if exists(path):
        shell("rmdir /s /q " + cmd_quote(path))
    end
end

function copy_file_shell(src, dst):
    ensure_parent_dir(dst)
    code = shell("copy /y " + cmd_quote(src) + " " + cmd_quote(dst) + " >nul")
    return code == 0 and exists(dst)
end

function copy_dir_shell(src, dst):
    code = shell("xcopy " + cmd_quote(src) + " " + cmd_quote(dst) + " /E /I /Y >nul")
    return code == 0 or exists(dst)
end

function run_batch_capture(batch_path, output_path):
    code = shell("cmd /c " + cmd_quote(batch_path))
    output = ""
    if exists(output_path):
        output = read_text(output_path, "")
    end
    return {
        "code": code,
        "output": output
    }
end

function join_command_args(args):
    if type(args) != "list" or len(args) == 0:
        return ""
    end
    parts = []
    for item in args:
        append(parts, cmd_quote(item))
    end
    return " " + join(parts, " ")
end

function make_runtime_js(project):
    template_path = join_path(get_app_dir(), "app\\game-template.js")
    if not exists(template_path):
        template_path = join_path(get_app_dir(), "desktop\\game-template.js")
    end
    template = read_text(template_path, "")
    return replace(template, "__SELENFORGE_PAYLOAD__", json_encode({
        "project": project
    }))
end

function make_runtime_html(game_name):
    template_path = join_path(get_app_dir(), "app\\game-template.html")
    if not exists(template_path):
        template_path = join_path(get_app_dir(), "desktop\\game-template.html")
    end
    template = read_text(template_path, "")
    return replace(template, "__SELENFORGE_GAME_NAME__", game_name)
end

function make_player_source(game_name, width, height):
    lines = []
    append(lines, "APP_TITLE = " + json_encode(game_name))
    append(lines, "APP_WIDTH = " + str(width))
    append(lines, "APP_HEIGHT = " + str(height))
    append(lines, "APP_ENTRY_FILE = \"app\\\\index.html\"")
    append(lines, "")
    append(lines, "function get_app_dir():")
    append(lines, "    args = argv()")
    append(lines, "    if type(args) == \"list\" and len(args) > 0:")
    append(lines, "        return dirname(absolute_path(str(args[0])))")
    append(lines, "    end")
    append(lines, "    return getcwd()")
    append(lines, "end")
    append(lines, "")
    append(lines, "function to_file_url(path):")
    append(lines, "    p = replace(absolute_path(path), \"\\\\\", \"/\")")
    append(lines, "    if len(p) > 1 and substring(p, 1, 1) == \":\":")
    append(lines, "        return \"file:///\" + p")
    append(lines, "    end")
    append(lines, "    return \"file://\" + p")
    append(lines, "end")
    append(lines, "")
    append(lines, "function main():")
    append(lines, "    gui_init()")
    append(lines, "    gui_create(APP_TITLE, APP_WIDTH, APP_HEIGHT, {\"center\": true, \"resizable\": true, \"frameless\": false, \"transparent\": false})")
    append(lines, "    gui_load_url(to_file_url(join_path(get_app_dir(), APP_ENTRY_FILE)))")
    append(lines, "    gui_run()")
    append(lines, "end")
    append(lines, "")
    append(lines, "main()")
    return join(lines, "\n")
end

function execute_system_moon_script(payload_json):
    payload = decode_payload_dict(payload_json)
    source = str(get(payload, "source", ""))
    script_name = safe_file_name(get(payload, "name", "system_script.moon"), "system_script.moon")
    args = []
    if has_key(payload, "args") and type(payload["args"]) == "list":
        args = payload["args"]
    end

    work_root = join_path(get_app_dir(), "system_runs")
    ensure_dir(work_root)
    run_id = safe_file_name("run_" + str(now()), "run")
    run_dir = join_path(work_root, run_id)
    ensure_dir(run_dir)

    script_path = join_path(run_dir, script_name)
    exe_name = replace(script_name, ".moon", ".exe")
    exe_path = join_path(run_dir, exe_name)
    output_path = join_path(run_dir, "output.txt")
    batch_path = join_path(run_dir, "run.bat")
    moonc_path = join_path(get_app_dir(), "MulanMoonlang\\moonc.exe")

    write_text(script_path, source)
    batch_lines = []
    append(batch_lines, "@echo off")
    append(batch_lines, "chcp 65001 >nul")
    append(batch_lines, "setlocal")
    append(batch_lines, cmd_quote(moonc_path) + " " + cmd_quote(script_path) + " -o " + cmd_quote(exe_path) + " > " + cmd_quote(output_path) + " 2>&1")
    append(batch_lines, "if errorlevel 1 exit /b %errorlevel%")
    append(batch_lines, cmd_quote(exe_path) + join_command_args(args) + " >> " + cmd_quote(output_path) + " 2>&1")
    append(batch_lines, "exit /b %errorlevel%")
    write_text(batch_path, join(batch_lines, "\n"))

    result = run_batch_capture(batch_path, output_path)
    return json_encode({
        "ok": result["code"] == 0,
        "code": result["code"],
        "output": result["output"],
        "runDir": absolute_path(run_dir),
        "scriptPath": absolute_path(script_path),
        "exePath": absolute_path(exe_path)
    })
end

function build_game(payload_json):
    payload_raw = unwrap_gui_payload(payload_json)
    append_log("[build_game] payload_raw=" + str(payload_raw) + "\n")
    payload = decode_payload_dict(payload_json)
    append_log("[build_game] payload_keys=" + str(len(keys(payload))) + "\n")
    game_name = str(get(payload, "gameName", "SelenforgeGame"))
    company_name = str(get(payload, "companyName", "Selenforge"))
    version = str(get(payload, "version", "0.1.0"))
    width = int(get(payload, "width", 1280))
    height = int(get(payload, "height", 720))

    project = read_project_from_snapshot(active_snapshot_dir())
    safe_game_name = safe_file_name(game_name, "SelenforgeGame")
    build_root = join_path(get_app_dir(), "builds")
    build_dir = join_path(build_root, safe_game_name)
    app_dir = join_path(build_dir, "app")
    vendor_dir = join_path(build_dir, "vendor")
    project_dir = join_path(build_dir, "project")
    moonlang_dir = join_path(build_dir, "MulanMoonlang")
    output_path = join_path(build_dir, "build-output.txt")
    batch_path = join_path(build_dir, "build.bat")
    player_source_path = join_path(build_dir, "game_player.moon")
    exe_name = safe_game_name + ".exe"
    exe_path = join_path(build_dir, exe_name)
    moonc_path = join_path(get_app_dir(), "MulanMoonlang\\moonc.exe")
    runtime_src = join_path(get_app_dir(), "vendor\\moonflare.js")
    if not exists(runtime_src):
        runtime_src = join_path(get_app_dir(), "engine\\build\\playcanvas.js")
    end
    append_log("[build_game] target_dir=" + absolute_path(build_dir) + "\n")

    remove_dir_shell(build_dir)
    ensure_dir(build_dir)
    ensure_dir(app_dir)
    ensure_dir(vendor_dir)
    ensure_dir(project_dir)
    append_log("[build_game] directories_ready\n")

    write_text(join_path(app_dir, "index.html"), make_runtime_html(game_name))
    write_text(join_path(app_dir, "game.js"), make_runtime_js(project))
    write_text(join_path(project_dir, PROJECT_FILE_NAME), json_encode(project))
    write_text(player_source_path, make_player_source(game_name, width, height))
    append_log("[build_game] templates_written\n")
    copy_file_shell(runtime_src, join_path(vendor_dir, "moonflare.js"))
    copy_dir_shell(join_path(get_app_dir(), "MulanMoonlang"), moonlang_dir)
    append_log("[build_game] runtime_copied\n")

    source_snapshot_dir = active_snapshot_dir()
    for script in project["scripts"]:
        write_text(join_path(project_dir, str(script["path"])), str(script["source"]))
        runtime_src_file = join_path(join_path(source_snapshot_dir, "runtime"), replace(str(script["name"]), ".moon", ".js"))
        runtime_dst_file = join_path(join_path(project_dir, "runtime"), replace(str(script["name"]), ".moon", ".js"))
        if exists(runtime_src_file):
            copy_file_shell(runtime_src_file, runtime_dst_file)
            continue
        end
        compiled_js = ""
        if has_key(script, "compiledJs"):
            compiled_js = str(script["compiledJs"])
        end
        write_text(runtime_dst_file, compiled_js)
    end

    batch_lines = []
    append(batch_lines, "@echo off")
    append(batch_lines, "chcp 65001 >nul")
    append(batch_lines, "setlocal")
    append(batch_lines, cmd_quote(moonc_path) + " " + cmd_quote(player_source_path) + " -o " + cmd_quote(exe_path) + " --company " + cmd_quote(company_name) + " --description " + cmd_quote(game_name) + " --product-name " + cmd_quote(safe_game_name) + " --file-version " + cmd_quote(version + ".0") + " > " + cmd_quote(output_path) + " 2>&1")
    append(batch_lines, "exit /b %errorlevel%")
    write_text(batch_path, join(batch_lines, "\n"))

    result = run_batch_capture(batch_path, output_path)
    append_log("[" + str(now()) + "] build game " + absolute_path(build_dir) + " code=" + str(result["code"]) + "\n")
    return json_encode({
        "ok": result["code"] == 0,
        "code": result["code"],
        "outputDir": absolute_path(build_dir),
        "exePath": absolute_path(exe_path),
        "log": result["output"]
    })
end

function load_project(payload_json):
    slot_dir = ensure_default_snapshot()
    latest = latest_snapshot_number()
    if latest > 0:
        slot_dir = get_snapshot_dir(latest)
    end

    global CURRENT_SNAPSHOT_DIR
    CURRENT_SNAPSHOT_DIR = slot_dir

    project = read_project_from_snapshot(slot_dir)
    append_log("[" + str(now()) + "] load snapshot " + absolute_path(slot_dir) + "\n")
    return json_encode({
        "ok": true,
        "project": project,
        "brand": default_brand(),
        "links": default_links(),
        "paths": build_paths(slot_dir)
    })
end

function save_project(payload_json):
    payload = decode_payload_dict(payload_json)
    project = normalize_project(payload)
    slot_dir = active_snapshot_dir()
    slot_name = basename(slot_dir)
    slot_number = extract_slot_number(slot_name)
    if slot_number <= 0:
        slot_number = 1
    end
    slot_dir = save_snapshot(project, slot_number)
    return json_encode({
        "ok": true,
        "project": project,
        "path": absolute_path(get_project_file(slot_dir)),
        "paths": build_paths(slot_dir)
    })
end

function build_info(payload_json):
    slot_dir = active_snapshot_dir()
    return json_encode({
        "ok": true,
        "brand": default_brand(),
        "links": default_links(),
        "paths": build_paths(slot_dir)
    })
end

function debug_log(payload_json):
    detail = unwrap_gui_payload(payload_json)
    if type(detail) != "string":
        detail = str(detail)
    end
    append_log("[" + str(now()) + "] " + detail + "\n")
    return json_encode({
        "ok": true,
        "path": absolute_path(get_log_file())
    })
end

function error_html(message):
    return "<!doctype html><html lang=\"zh-CN\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><title>Selenforge 启动失败</title></head><body style=\"margin:0;min-height:100vh;display:grid;place-items:center;background:#08111a;font-family:'Microsoft YaHei UI','Segoe UI',sans-serif;color:#e7f1fb;\"><div style=\"width:min(760px,92vw);padding:24px;border:1px solid rgba(164,206,245,.24);border-radius:20px;background:rgba(10,19,30,.94)\"><h2 style=\"margin:0 0 12px\">Selenforge Editor 启动失败</h2><p style=\"margin:0 0 8px;line-height:1.7\">请检查程序目录是否完整，尤其是以下文件：</p><pre style=\"white-space:pre-wrap;background:#02060b;padding:14px;border-radius:12px;border:1px solid rgba(164,206,245,.16)\">" + message + "</pre></div></body></html>"
end

function handle_cli_mode():
    args = argv()
    append_log("[cli] argc=" + str(len(args)) + " args=" + json_encode(args) + "\n")
    if type(args) != "list" or len(args) < 2:
        return false
    end

    command = str(args[1])
    append_log("[cli] command=" + command + "\n")
    payload = "{}"
    if len(args) >= 3:
        payload = str(args[2])
    end

    if command == "--build-game-json":
        append_log("[cli] enter build_game\n")
        print(build_game(payload))
        exit(0)
        return true
    end

    if command == "--build-game-file" and len(args) >= 3:
        append_log("[cli] enter build_game file\n")
        print(build_game(read_text(str(args[2]), "{}")))
        exit(0)
        return true
    end

    if command == "--run-system-script-json":
        append_log("[cli] enter execute_system_moon_script\n")
        print(execute_system_moon_script(payload))
        exit(0)
        return true
    end

    return false
end

function main():
    ensure_default_snapshot()
    if handle_cli_mode():
        return
    end

    webview_args = "--enable-webgl --enable-webgl2 --ignore-gpu-blocklist --enable-features=Vulkan --disable-features=msWebOOUI,WinRetrieveSuggestionsOnlyOnDemand"
    old_args = env("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS")
    if type(old_args) == "string" and len(trim(old_args)) > 0:
        webview_args = old_args + " " + webview_args
    end
    set_env("WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS", webview_args)
    set_env("WEBVIEW2_USER_DATA_FOLDER", absolute_path(join_path(get_app_dir(), "webview2_profile")))

    gui_init()
    gui_create(APP_TITLE, APP_WIDTH, APP_HEIGHT, {
        "center": true,
        "resizable": true,
        "frameless": false,
        "transparent": false,
        "icon": join_path(get_app_dir(), APP_ICON_ICO)
    })

    entry_path = join_path(get_app_dir(), APP_ENTRY_FILE)
    if exists(entry_path):
        gui_load_url(to_file_url(entry_path))
        gui_expose("loadProject", load_project)
        gui_expose("saveProject", save_project)
        gui_expose("executeSystemMoonScript", execute_system_moon_script)
        gui_expose("buildGame", build_game)
        gui_expose("buildInfo", build_info)
        gui_expose("debugLog", debug_log)
    else:
        gui_load_html(error_html("缺少桌面前端入口文件：\n" + absolute_path(entry_path)))
    end

    gui_run()
end

main()
