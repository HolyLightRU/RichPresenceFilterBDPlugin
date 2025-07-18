/**
 * @name RichPresenceFilter
 * @description Фильтрует активность по String blackList из настроек
 * @version 2.1.4
 * @author HolyLightRU
 * @source https://github.com/HolyLightRU/RichPresenceFilterBDPlugin
 */

module.exports = class RichPresenceFilter {
    constructor() {
        this.defaultSettings = {
            blacklist: [],
            enabled: true
        };
        
        this.settings = {...this.defaultSettings};
        this.api = new BdApi("RichPresenceFilter");
    }

    load() {
        this.settings = BdApi.Data.load("RichPresenceFilter", "settings") || {...this.defaultSettings};
    }

    start() {
        this.patchActivityUpdate();
        
        BdApi.injectCSS("RichPresenceFilter", `
            .rich-presence-filter-settings {
                padding: 16px;
                background: rgba(255, 235, 238, 0.1);
                border-radius: 8px;
                font-family: 'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            }
            
            .rich-presence-filter-header {
                display: flex;
                align-items: center;
                margin-bottom: 16px;
                color: #ff8fab;
            }
            
            .rich-presence-filter-icon {
                width: 24px;
                height: 24px;
                margin-right: 10px;
                background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmOGZhYiIgZD0iTTEyLDJBMTAsMTAgMCAwLDAgMiwxMkExMCwxMCAwIDAsMCAxMiwyMkExMCwxMCAwIDAsMCAyMiwxMkExMCwxMCAwIDAsMCAxMiwyTTEyLDRBOCw4IDAgMCwxIDIwLDEyQTgsOCAwIDAsMSAxMiwyMEE4LDggMCAwLDEgNCwxMkE4LDggMCAwLDEgMTIsNE0xMiwxMEEyLDIgMCAwLDAgMTAsMTJBMiwyIDAgMCwwIDEyLDE0QTIsMiAwIDAsMCAxNCwxMkEyLDIgMCAwLDAgMTIsMTBNNywxMEEyLDIgMCAwLDAgNSwxMkEyLDIgMCAwLDAgNywxNEEyLDIgMCAwLDAgOSwxMkEyLDIgMCAwLDAgNywxME0xNywxMEEyLDIgMCAwLDAgMTUsMTJBMiwyIDAgMCwwIDE3LDE0QTIsMiAwIDAsMCAxOSwxMkEyLDIgMCAwLDAgMTcsMTAiIC8+PC9zdmc+');
                background-size: contain;
            }
            
            .rich-presence-filter-title {
                font-size: 20px;
                font-weight: 600;
                margin: 0;
            }
            
            .rich-presence-filter-toggle {
                display: flex;
                align-items: center;
                margin-bottom: 20px;
                padding: 10px;
                background: rgba(255, 143, 171, 0.1);
                border-radius: 6px;
            }
            
            .rich-presence-filter-toggle label {
                display: flex;
                align-items: center;
                cursor: pointer;
                font-weight: 500;
                color: #f8f8f8;
            }
            
            .rich-presence-filter-toggle input {
                margin-right: 10px;
                accent-color: #ff8fab;
                cursor: pointer;
            }
            
            .rich-presence-filter-section {
                margin-bottom: 16px;
                color: #f8f8f8;
            }
            
            .rich-presence-filter-section-title {
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 8px;
                color: #ff8fab;
            }
            
            .rich-presence-filter-section-desc {
                font-size: 14px;
                opacity: 0.8;
                margin-bottom: 12px;
            }
            
            .rich-presence-filter-entry {
                display: flex;
                margin-bottom: 8px;
                align-items: center;
                background: rgba(255, 143, 171, 0.05);
                border-radius: 4px;
                padding: 6px;
                transition: background 0.2s;
            }
            
            .rich-presence-filter-entry:hover {
                background: rgba(255, 143, 171, 0.1);
            }
            
            .rich-presence-filter-entry input {
                flex-grow: 1;
                margin-right: 8px;
                padding: 8px;
                background: rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 143, 171, 0.3);
                border-radius: 4px;
                color: #f8f8f8;
                outline: none;
            }
            
            .rich-presence-filter-entry input:focus {
                border-color: #ff8fab;
            }
            
            .rich-presence-filter-entry button {
                padding: 8px 12px;
                background: rgba(255, 143, 171, 0.3);
                border: none;
                border-radius: 4px;
                color: white;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .rich-presence-filter-entry button:hover {
                background: rgba(255, 143, 171, 0.5);
            }
            
            .rich-presence-filter-add {
                display: flex;
                margin-top: 12px;
            }
            
            .rich-presence-filter-add input {
                flex-grow: 1;
                padding: 8px;
                background: rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 143, 171, 0.3);
                border-radius: 4px 0 0 4px;
                color: #f8f8f8;
                outline: none;
            }
            
            .rich-presence-filter-add input:focus {
                border-color: #ff8fab;
            }
            
            .rich-presence-filter-add button {
                padding: 8px 16px;
                background: rgba(255, 143, 171, 0.5);
                border: none;
                border-radius: 0 4px 4px 0;
                color: white;
                cursor: pointer;
                transition: background 0.2s;
            }
            
            .rich-presence-filter-add button:hover {
                background: rgba(255, 143, 171, 0.7);
            }
        `);
    }

    stop() {
        BdApi.Patcher.unpatchAll("RichPresenceFilter");
        BdApi.clearCSS("RichPresenceFilter");
    }

    patchActivityUpdate() {
        const rpcModule = this.api.Webpack.getModule(this.api.Webpack.Filters.byKeys("dispatch", "_subscriptions"));
        
        if (rpcModule) {
            BdApi.Patcher.before("RichPresenceFilter", rpcModule, "dispatch", (_, args) => {
                if (!this.settings.enabled) return;
                
                const [action] = args;
                if (action?.type !== "LOCAL_ACTIVITY_UPDATE" || !action.activity) return;
                
                const activity = action.activity;
                if (!activity.name) return;
                
                if (this.settings.blacklist.includes(activity.name.toLowerCase())) {
                    args[0].activity = null;
                    console.log(`[RichPresenceFilter] Blocked activity: ${activity.name}`);
                }
            });
        } else {
            console.error("[RichPresenceFilter] Could not find RPC module to patch");
        }
    }

    getSettingsPanel() {
        const { React } = BdApi;
        const { useState } = React;

        const SettingsComponent = () => {
            const [updateFlag, setUpdateFlag] = useState(false);
            const [newActivity, setNewActivity] = useState("");

            const forceUpdate = () => setUpdateFlag(!updateFlag);

            const handleAddActivity = () => {
                if (newActivity.trim()) {
                    this.settings.blacklist = [
                        ...this.settings.blacklist,
                        newActivity.trim().toLowerCase()
                    ];
                    this.saveSettings();
                    setNewActivity("");
                    forceUpdate();
                }
            };

            const handleRemoveActivity = (index) => {
                this.settings.blacklist = this.settings.blacklist.filter((_, i) => i !== index);
                this.saveSettings();
                forceUpdate();
            };

            const handleActivityChange = (index, value) => {
                const newBlacklist = [...this.settings.blacklist];
                newBlacklist[index] = value.toLowerCase();
                this.settings.blacklist = newBlacklist;
                this.saveSettings();
                forceUpdate();
            };

            return React.createElement("div", {className: "rich-presence-filter-settings"},
                React.createElement("div", {className: "rich-presence-filter-header"},
                    React.createElement("div", {className: "rich-presence-filter-icon"}),
                    React.createElement("h3", {className: "rich-presence-filter-title"}, "RichPresence Filter")
                ),
                
                React.createElement("div", {className: "rich-presence-filter-toggle"},
                    React.createElement("label", null,
                        React.createElement("input", {
                            type: "checkbox",
                            checked: this.settings.enabled,
                            onChange: e => {
                                this.settings.enabled = e.target.checked;
                                this.saveSettings();
                                forceUpdate();
                            }
                        }),
                        " Enable Plugin"
                    )
                ),
                
                React.createElement("div", {className: "rich-presence-filter-section"},
                    React.createElement("h4", {className: "rich-presence-filter-section-title"}, "Blacklisted Activities"),
                    React.createElement("p", {className: "rich-presence-filter-section-desc"},
                        "Activities matching these names will be blocked from showing in your profile."
                    ),
                    
                    React.createElement("div", null,
                        this.settings.blacklist.map((activity, index) =>
                            React.createElement("div", {key: index, className: "rich-presence-filter-entry"},
                                React.createElement("input", {
                                    type: "text",
                                    value: activity,
                                    onChange: e => handleActivityChange(index, e.target.value)
                                }),
                                React.createElement("button", {
                                    onClick: () => handleRemoveActivity(index)
                                }, "Remove")
                            )
                        )
                    ),
                    
                    React.createElement("div", {className: "rich-presence-filter-add"},
                        React.createElement("input", {
                            type: "text",
                            value: newActivity,
                            placeholder: "Enter activity name to block",
                            onChange: e => setNewActivity(e.target.value),
                            onKeyDown: e => e.key === "Enter" && handleAddActivity()
                        }),
                        React.createElement("button", {
                            onClick: handleAddActivity
                        }, "Add Activity")
                    )
                )
            );
        };

        return React.createElement(SettingsComponent);
    }

    saveSettings() {
        BdApi.Data.save("RichPresenceFilter", "settings", this.settings);
    }
};