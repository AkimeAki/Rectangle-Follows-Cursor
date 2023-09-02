import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

function App() {
	return (
		<Box sx={{ width: "300px" }}>
			<AppBar position="static">
				<Toolbar>
					<Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: "center" }}>
						設定
					</Typography>
				</Toolbar>
			</AppBar>
			<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px", padding: "5px" }}>あああ</Box>
		</Box>
	);
}

export default App;
