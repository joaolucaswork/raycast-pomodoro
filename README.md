# 🍅 Raycast Pomodoro Timer

A comprehensive Pomodoro timer extension for Raycast on Windows with advanced productivity tracking, customizable intervals, and detailed analytics.

## ✨ Features

### Core Pomodoro Functionality

- **Persistent Background Timer**: Timer continues running even when extension is closed
- **Menu Bar Integration**: Always-visible timer status in your menu bar with 1-second updates
- **Timer Management**: Start, pause, resume, stop, and reset timers
- **Configurable Intervals**: Customize work (default 25min), short break (5min), and long break (15min) durations
- **Session Tracking**: Automatic session counting with long break intervals
- **Audio Notifications**: Sound alerts when sessions complete (configurable)
- **Visual Progress**: Real-time progress indicators and time remaining display
- **Timestamp-based Tracking**: Uses system timestamps for accurate time tracking across app restarts

### Advanced Features

- **Timer History**: Complete session history with detailed statistics
- **Task Association**: Link Pomodoro sessions to specific tasks and projects
- **Productivity Analytics**: Detailed insights including completion rates, streaks, and productivity patterns
- **Custom Presets**: Pre-configured timer settings for different work styles
- **Data Export**: Export session data in JSON and CSV formats
- **Auto-start Options**: Automatically start breaks or work sessions

### Windows Integration

- **System Notifications**: Native Windows toast notifications
- **Keyboard Shortcuts**: Quick actions with customizable hotkeys
- **Menu Bar Timer**: Persistent timer display in Raycast's menu bar
- **Background Operation**: Timer continues running when extension is closed
- **Focus Assist**: Integration with Windows Focus Assist mode (planned)

## 🚀 Quick Start

1. **Install Dependencies**:

   ```bash
   pnpm install
   ```

2. **Start Development**:

   ```bash
   pnpm run dev
   ```

3. **Build Extension**:
   ```bash
   pnpm run build
   ```

## 📋 Commands

The extension provides four main commands:

### 🍅 Pomodoro Timer

- **Command**: `main-command`
- **Description**: Main timer interface with full controls
- **Features**: Start sessions, view progress, manage tasks
- **Shortcuts**:
  - `Cmd+T`: Start work session with task
  - `Cmd+Shift+Enter`: Quick start work session
  - `Cmd+Space`: Pause/Resume timer
  - `Cmd+S`: Stop timer

### 📊 Timer History

- **Command**: `timer-history`
- **Description**: View session history and detailed statistics
- **Features**: Session details, productivity insights, data export
- **Shortcuts**:
  - `Cmd+S`: View statistics

### ⚡ Quick Start Timer

- **Command**: `quick-start`
- **Description**: Instantly start a work session
- **Features**: No-UI quick start for immediate productivity

### 📍 Menu Bar Timer

- **Command**: `menu-bar-timer`
- **Description**: Persistent timer display in the menu bar
- **Features**:
  - Always-visible timer status with 1-second updates
  - Background timer operation (continues when extension is closed)
  - Quick access to timer controls from menu bar
  - Real-time session progress and statistics
  - Automatic state synchronization across app restarts

## ⚙️ Configuration

### Timer Settings

- **Work Duration**: 1-180 minutes (default: 25)
- **Short Break**: 1-60 minutes (default: 5)
- **Long Break**: 1-120 minutes (default: 15)
- **Long Break Interval**: 1-10 sessions (default: 4)

### Notification Settings

- **Audio Notifications**: Enable/disable completion sounds
- **Auto-start Breaks**: Automatically begin break timers
- **Auto-start Work**: Automatically begin work sessions after breaks

## 📊 Statistics & Analytics

### Overview Metrics

- Total and completed sessions
- Productivity score and completion rate
- Current and longest streaks
- Time breakdowns (work vs. break time)

### Advanced Analytics

- Most productive hours and days
- Average session lengths
- Task and project productivity
- Weekly and monthly trends

### Productivity Insights

- Personalized recommendations based on usage patterns
- Streak achievements and motivation
- Focus pattern analysis
- Completion rate optimization tips

## 🎯 Task Management

### Task Association

- Link sessions to specific tasks
- Organize tasks by projects
- Track Pomodoro estimates vs. actual completion
- Task progress visualization

### Project Tracking

- Group related tasks into projects
- Project-level productivity metrics
- Color-coded organization
- Progress tracking across projects

## 🚀 Usage

### Using the Persistent Timer

1. **Enable Menu Bar Timer**: Add the "Menu Bar Timer" command to your Raycast setup
2. **Start a Session**: Use any of the timer commands to start a Pomodoro session
3. **Close Extension**: The timer will continue running in the background
4. **Monitor Progress**: Check the menu bar for real-time timer status
5. **Resume Control**: Open any timer command to regain full control

### Background Operation

The timer uses timestamp-based tracking, which means:

- ✅ Timer continues when extension is closed
- ✅ Accurate time tracking across app restarts
- ✅ No battery drain from constant intervals
- ✅ Automatic state synchronization
- ✅ Persistent session data

### Menu Bar Features

- **Real-time Display**: Shows current session type and remaining time
- **Quick Controls**: Start, pause, resume, and stop directly from menu bar
- **Session Info**: View current task and project details
- **Statistics**: Today's session count and streak information
- **Navigation**: Quick access to main timer and history views

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   └── preset-selector.tsx
├── hooks/               # Custom React hooks
│   └── useTimer.ts
├── services/            # Business logic services
│   ├── background-timer-service.ts  # Persistent timer logic
│   ├── data-service.ts
│   ├── notification-service.ts
│   ├── preferences-service.ts
│   ├── task-service.ts
│   └── windows-integration.ts
├── store/               # State management
│   └── timer-store.ts
├── types/               # TypeScript definitions
│   └── timer.ts
├── utils/               # Utility functions
│   ├── helpers.ts
│   ├── storage-adapter.ts           # Storage abstraction layer
│   ├── zustand-storage.ts           # Custom Zustand storage
│   └── windows-helpers.ts
├── main-command.tsx     # Main timer interface
├── menu-bar-timer.tsx   # Persistent menu bar timer
├── timer-history.tsx    # History and statistics
└── quick-start.tsx      # Quick start command
```

## 🛠️ Development

### Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run lint` - Run ESLint
- `pnpm run fix-lint` - Fix linting issues

### Key Technologies

- **React**: UI components and state management
- **TypeScript**: Type-safe development
- **Zustand**: Lightweight state management with persistence
- **date-fns**: Date manipulation and formatting
- **Raycast API**: Native Raycast integration

## 🎨 Customization

### Timer Presets

- **Classic Pomodoro**: 25/5/15 minute intervals
- **Extended Focus**: 45/10/30 minute intervals for deep work
- **Short Bursts**: 15/3/10 minute intervals for high-energy tasks
- **Study Session**: 30/5/20 minute intervals optimized for learning
- **Creative Flow**: 90/15/45 minute intervals for creative work

### Productivity Tips Integration

- Contextual tips based on session patterns
- Recommendations for optimal session lengths
- Streak building strategies
- Focus improvement suggestions

## 📈 Data Management

### Local Storage

- Session history persistence
- Configuration settings
- Task and project data
- Statistics and analytics

### Export Options

- **JSON Export**: Complete data backup
- **CSV Export**: Spreadsheet-compatible format
- **Statistics Summary**: Key metrics overview

## 🔧 Windows-Specific Features

### System Integration

- Native Windows notifications
- Taskbar progress indicators (planned)
- Focus Assist integration (planned)
- System tray functionality (planned)

### Performance Optimizations

- Efficient timer management
- Minimal resource usage
- Background operation support
- Fast startup and response times

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 💡 Tips for Maximum Productivity

1. **Start Small**: Begin with shorter sessions if you're new to Pomodoro
2. **Use Tasks**: Associate sessions with specific tasks for better tracking
3. **Take Breaks**: Don't skip breaks - they're essential for sustained focus
4. **Review Stats**: Check your analytics weekly to identify patterns
5. **Customize Settings**: Adjust intervals based on your work style
6. **Build Streaks**: Consistent daily sessions build powerful habits

## 🆘 Support

- **Documentation**: Check the inline help and tooltips
- **Issues**: Report bugs or request features on GitHub
- **Community**: Share tips and experiences with other users

---

**Happy Focusing! 🎯**
