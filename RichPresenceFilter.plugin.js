/**
 * @name RichPresenceFilter
 * @description Фильтрует RichPresence активность по блэклисту из настроек
 * @version 2.2.3
 * @author HolyLight
 * @source https://github.com/HolyLightRU/RichPresenceFilterBDPlugin
 */

module.exports = class RichPresenceFilter {
    constructor() {
        this.defaultSettings = {
            blacklist: [],
            enabled: true,
            checkApplicationNames: true,
            checkState: true
        };
        
        this.settings = {...this.defaultSettings};
        this.api = new BdApi("RichPresenceFilter");
    }

    load() {
        this.settings = BdApi.Data.load("RichPresenceFilter", "settings") || {...this.defaultSettings};
    }

    start() {
        this.patchActivityUpdate();
        
        const style = document.createElement('style');
        style.id = 'RichPresenceFilterCSS';
        style.textContent = `
        .rich-presence-filter-settings {
            padding: 20px;
            background: rgba(25, 28, 36, 0.8);
            border-radius: 12px;
            font-family: 'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            border: 1px solid rgba(255, 143, 171, 0.2);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
        }
            
            .rich-presence-filter-header {
                display: flex;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 12px;
                border-bottom: 1px solid rgba(255, 143, 171, 0.2);
            }
            
            .rich-presence-filter-icon {
                width: 28px;
                height: 28px;
                margin-right: 10px;
                background: linear-gradient(135deg, #ff8fab, #90e0ef);
                -webkit-mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyLDJBMTAsMTAgMCAwLDAgMiwxMkExMCwxMCAwIDAsMCAxMiwyMkExMCwxMCAwIDAsMCAyMiwxMkExMCwxMCAwIDAsMCAxMiwyTTEyLDRBOCw4IDAgMCwxIDIwLDEyQTgsOCAwIDAsMSAxMiwyMEE4LDggMCAwLDEgNCwxMkE4LDggMCAwLDEgMTIsNE0xMiwxMEEyLDIgMCAwLDAgMTAsMTJBMiwyIDAgMCwwIDEyLDE0QTIsMiAwIDAsMCAxNCwxMkEyLDIgMCAwLDAgMTIsMTBNNywxMEEyLDIgMCAwLDAgNSwxMkEyLDIgMCAwLDAgNywxNEEyLDIgMCAwLDAgOSwxMkEyLDIgMCAwLDAgNywxME0xNywxMEEyLDIgMCAwLDAgMTUsMTJBMiwyIDAgMCwwIDE3LDE0QTIsMiAwIDAsMCAxOSwxMkEyLDIgMCAwLDAgMTcsMTAiIC8+PC9zdmc+') no-repeat center;
                mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyLDJBMTAsMTAgMCAwLDAgMiwxMkExMCwxMCAwIDAsMCAxMiwyMkExMCwxMCAwIDAsMCAyMiwxMkExMCwxMCAwIDAsMCAxMiwyTTEyLDRBOCw4IDAgMCwxIDIwLDEyQTgsOCAwIDAsMSAxMiwyMEE4LDggMCAwLDEgNCwxMkE4LDggMCAwLDEgMTIsNE0xMiwxMEEyLDIgMCAwLDAgMTAsMTJBMiwyIDAgMCwwIDEyLDE0QTIsMiAwIDAsMCAxNCwxMkEyLDIgMCAwLDAgMTIsMTBNNywxMEEyLDIgMCAwLDAgNSwxMkEyLDIgMCAwLDAgNywxNEEyLDIgMCAwLDAgOSwxMkEyLDIgMCAwLDAgNywxME0xNywxMEEyLDIgMCAwLDAgMTUsMTJBMiwyIDAgMCwwIDE3LDE0QTIsMiAwIDAsMCAxOSwxMkEyLDIgMCAwLDAgMTcsMTAiIC8+PC9zdmc+') no-repeat center;
            }
            
            .rich-presence-filter-title {
                font-size: 22px;
                font-weight: 700;
                margin: 0;
                background: linear-gradient(90deg, #ff8fab, #90e0ef);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
            }
            
            .rich-presence-filter-author {
                margin-left: auto;
                font-weight: 600;
                font-size: 14px;
                background: linear-gradient(90deg, #ff8fab, #90e0ef);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .rich-presence-filter-social {
                color: #90e0ef;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
            }
            
            .rich-presence-filter-social:hover {
                color: #ff8fab;
                transform: translateY(-2px);
            }
            
            .rich-presence-filter-section {
                margin-bottom: 24px;
                color: #f8f8f8;
            }
            
            .rich-presence-filter-section-title {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 10px;
                background: linear-gradient(90deg, #ff8fab, #90e0ef);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
            }
            
            .rich-presence-filter-section-desc {
                font-size: 14px;
                opacity: 0.8;
                margin-bottom: 16px;
                line-height: 1.5;
            }
            
            .rich-presence-filter-entry {
                display: flex;
                margin-bottom: 10px;
                align-items: center;
                background: rgba(255, 143, 171, 0.08);
                border-radius: 6px;
                padding: 8px;
                transition: all 0.3s ease;
                border: 1px solid rgba(255, 143, 171, 0.1);
            }
            
            .rich-presence-filter-entry:hover {
                background: rgba(255, 143, 171, 0.15);
                border-color: rgba(255, 143, 171, 0.3);
            }
            
            .rich-presence-filter-entry input {
                flex-grow: 1;
                margin-right: 10px;
                padding: 10px;
                background: rgba(10, 12, 16, 0.5);
                border: 1px solid rgba(255, 143, 171, 0.2);
                border-radius: 6px;
                color: #f8f8f8;
                outline: none;
                font-size: 14px;
                transition: all 0.3s ease;
            }
            
            .rich-presence-filter-entry input:focus {
                border-color: #ff8fab;
                box-shadow: 0 0 0 2px rgba(255, 143, 171, 0.2);
            }
            
            .rich-presence-filter-entry button {
                padding: 10px 16px;
                background: linear-gradient(90deg, rgba(255, 143, 171, 0.5), rgba(144, 224, 239, 0.5));
                border: none;
                border-radius: 6px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 500;
                font-size: 14px;
            }
            
            .rich-presence-filter-entry button:hover {
                background: linear-gradient(90deg, rgba(255, 143, 171, 0.7), rgba(144, 224, 239, 0.7));
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            
            .rich-presence-filter-add {
                display: flex;
                margin-top: 16px;
                border-radius: 6px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            
            .rich-presence-filter-add input {
                flex-grow: 1;
                padding: 12px;
                background: rgba(10, 12, 16, 0.5);
                border: 1px solid rgba(255, 143, 171, 0.2);
                color: #f8f8f8;
                outline: none;
                font-size: 14px;
                transition: all 0.3s ease;
            }
            
            .rich-presence-filter-add input:focus {
                border-color: #ff8fab;
                box-shadow: 0 0 0 2px rgba(255, 143, 171, 0.2);
            }
            
            .rich-presence-filter-add button {
                padding: 0 20px;
                background: linear-gradient(90deg, #ff8fab, #90e0ef);
                border: none;
                color: #0a0c10;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 600;
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .rich-presence-filter-add button:hover {
                background: linear-gradient(90deg, #ff9fba, #a0e9ff);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(255, 143, 171, 0.3);
            }
            
            .rich-presence-filter-add button:active {
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }

    stop() {
        BdApi.Patcher.unpatchAll("RichPresenceFilter");
        const style = document.getElementById('RichPresenceFilterCSS');
        if (style) style.remove();
    }

    patchActivityUpdate() {
        // Получаем модуль RPC через поиск по строковым ключам
        const rpcModule = this.api.Webpack.getModule(m => m?.default?.dispatch && m?.default?._subscriptions);
        if (rpcModule) {
            BdApi.Patcher.before("RichPresenceFilter", rpcModule.default, "dispatch", (_, args) => {
                if (!this.settings.enabled) return;
                
                const [action] = args;
                if (!action) return;

                const activityTypes = ["RUNNING_GAMES_CHANGE", "LOCAL_ACTIVITY_UPDATE"];
                if (!activityTypes.includes(action.type)) return;

                const shouldBlockActivity = (activity) => {
                    if (!activity) return false;
                    
                    const fieldsToCheck = [
                        activity.name,
                        activity.application?.name,
                        activity.details,
                        activity.state,
                        activity.assets?.large_text,
                        activity.assets?.small_text
                    ].filter(Boolean).map(s => s.toLowerCase());

                    return this.settings.blacklist.some(blacklisted => {
                        const lowerBlacklisted = blacklisted.toLowerCase();
                        return fieldsToCheck.some(field => field.includes(lowerBlacklisted));
                    });
                };

                if (action.type === "RUNNING_GAMES_CHANGE") {
                    const games = action.games || action.runningGames || [];
                    if (!Array.isArray(games)) return;

                    const filteredGames = games.filter(game => !shouldBlockActivity(game));
                    
                    if (filteredGames.length < games.length) {
                        if ('games' in action) {
                            args[0].games = filteredGames;
                        } else {
                            args[0].runningGames = filteredGames;
                        }
                    }
                    return;
                }

                if (action.type === "LOCAL_ACTIVITY_UPDATE" && action.activity) {
                    if (shouldBlockActivity(action.activity)) {
                        args[0].activity = null;
                    }
                }
            });
        }

        // Получаем PresenceStore через поиск по методам
        const presenceStore = this.api.Webpack.getModule(m => m?.getActivities && m?.getLocalActivity);
        if (presenceStore) {
            BdApi.Patcher.after("RichPresenceFilter", presenceStore, "getActivities", (_, __, res) => {
                if (!this.settings.enabled || !res) return res;
                
                return res.filter(activity => {
                    if (!activity) return false;
                    
                    const fieldsToCheck = [
                        activity.name,
                        activity.application?.name,
                        activity.details,
                        activity.state,
                        activity.assets?.large_text,
                        activity.assets?.small_text
                    ].filter(Boolean).map(s => s.toLowerCase());

                    return !this.settings.blacklist.some(blacklisted => {
                        const lowerBlacklisted = blacklisted.toLowerCase();
                        return fieldsToCheck.some(field => field.includes(lowerBlacklisted));
                    });
                });
            });
        }

        // Получаем IPC модуль через поиск по свойству
        const ipcModule = this.api.Webpack.getModule(m => m?.RPCServer);
        if (ipcModule) {
            BdApi.Patcher.before("RichPresenceFilter", ipcModule, "handleSocketMessage", (_, args) => {
                if (!this.settings.enabled) return;
                
                const [message] = args;
                if (message?.cmd === "SET_ACTIVITY" && message.args?.activity) {
                    const activity = message.args.activity;
                    const fieldsToCheck = [
                        activity.name,
                        activity.application?.name,
                        activity.details,
                        activity.state,
                        activity.assets?.large_text,
                        activity.assets?.small_text
                    ].filter(Boolean).map(s => s.toLowerCase());

                    const shouldBlock = this.settings.blacklist.some(blacklisted => {
                        const lowerBlacklisted = blacklisted.toLowerCase();
                        return fieldsToCheck.some(field => field.includes(lowerBlacklisted));
                    });

                    if (shouldBlock) {
                        args[0].args.activity = null;
                    }
                }
            });
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

            const toggleCheckApplicationNames = () => {
                this.settings.checkApplicationNames = !this.settings.checkApplicationNames;
                this.saveSettings();
                forceUpdate();
            };

            const toggleCheckState = () => {
                this.settings.checkState = !this.settings.checkState;
                this.saveSettings();
                forceUpdate();
            };

            return React.createElement("div", {className: "rich-presence-filter-settings"},
                React.createElement("div", {className: "rich-presence-filter-header"},
                    React.createElement("div", {className: "rich-presence-filter-icon"}),
                    React.createElement("h3", {className: "rich-presence-filter-title"}, "RichPresenceFilter"),
                    React.createElement("div", {className: "rich-presence-filter-author"},
                        "HolyLight",
                        React.createElement("a", {
                            href: "https://github.com/HolyLightRU",
                            target: "_blank",
                            className: "rich-presence-filter-social",
                            title: "GitHub Repository"
                        }, React.createElement("svg", {
                            xmlns: "http://www.w3.org/2000/svg",
                            width: "18",
                            height: "18",
                            fill: "currentColor",
                            viewBox: "0 0 16 16"
                        }, React.createElement("path", {
                            d: "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"
                        }))),
                        React.createElement("a", {
                            href: "https://t.me/notholylab",
                            target: "_blank",
                            className: "rich-presence-filter-social",
                            title: "Telegram"
                        }, React.createElement("svg", {
                            xmlns: "http://www.w3.org/2000/svg",
                            width: "18",
                            height: "18",
                            fill: "currentColor",
                            viewBox: "0 0 16 16"
                        }, React.createElement("path", {
                            d: "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09"
                        })))
                    )
                ),
                
                React.createElement("div", {className: "rich-presence-filter-section"},
                    React.createElement("h4", {className: "rich-presence-filter-section-title"}, "Черный список активностей"),
                    React.createElement("p", {className: "rich-presence-filter-section-desc"},
                        "Активности из этого списка не будут отображаться в вашем профиле"
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
                            placeholder: "Впишите название активности которую хотите фильтровать...",
                            onChange: e => setNewActivity(e.target.value),
                            onKeyDown: e => e.key === "Enter" && handleAddActivity()
                        }),
                        React.createElement("button", {
                            onClick: handleAddActivity
                        }, "Add")
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