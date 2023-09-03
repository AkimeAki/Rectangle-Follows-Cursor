import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import { defaultColor, defaultPointerMode } from "@/define";

const pointerSettings = [
	{
		mode: "1",
		name: "対象を囲う（ver 1）"
	},
	{
		mode: "4",
		name: "対象を囲うV2（ver 2）"
	},
	{
		mode: "2",
		name: "正方形がぐるぐるする（ver 2）"
	},
	{
		mode: "3",
		name: "変形なし（常に追従のみ）"
	}
];

function App() {
	const [pointerMode, setPointerMode] = useState<string>(defaultPointerMode);
	const [defaultColorCheck, setDefaultColorCheck] = useState<boolean>(true);
	const [color, setColor] = useState<string>(defaultColor);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		chrome.storage.sync.get(["pointerMode", "shapeColor"], (value) => {
			if (value.pointerMode !== undefined) {
				setPointerMode(value.pointerMode);
			}

			if (value.shapeColor !== undefined) {
				setColor(value.shapeColor);

				if (value.shapeColor !== defaultColor) {
					setDefaultColorCheck(false);
				}
			}

			setIsLoading(false);
		});
	}, []);

	return (
		<Box sx={{ width: "100%", height: "100%", display: "grid", gridTemplateColumns: "2fr 1fr" }}>
			<Box sx={{ width: "100%", height: "100%", overflow: "hidden" }}>
				<AppBar position="static">
					<Toolbar>
						<Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: "center" }}>
							設定
						</Typography>
					</Toolbar>
				</AppBar>
				<Box>
					<TableContainer>
						<Table sx={{ minWidth: 650 }} size="small">
							<TableBody
								sx={{
									"& th": {
										width: 300
									}
								}}
							>
								<TableRow>
									<TableCell component="th" scope="row" align="left">
										ポインター時の形状
									</TableCell>
									<TableCell align="left">
										<RadioGroup
											value={pointerMode}
											name="pointer-shape"
											onChange={(event) => {
												setPointerMode(event.target.value);
											}}
										>
											{pointerSettings.map((setting) => (
												<FormControlLabel
													key={setting.mode}
													value={setting.mode}
													control={<Radio />}
													label={setting.name}
													disabled={isLoading}
												/>
											))}
										</RadioGroup>
									</TableCell>
								</TableRow>
								<TableRow>
									<TableCell component="th" scope="row" align="left">
										色
									</TableCell>
									<TableCell align="left">
										<Box>
											<FormControlLabel
												control={
													<Checkbox
														checked={defaultColorCheck}
														disabled={isLoading}
														onChange={(event) => {
															setDefaultColorCheck(event.target.checked);

															if (event.target.checked) {
																setColor(defaultColor);
															}
														}}
													/>
												}
												label="デフォルト"
											/>
										</Box>
										<Box>
											<input
												value={color}
												disabled={isLoading}
												type="color"
												onChange={(event) => {
													setColor(event.target.value);

													if (event.target.value !== defaultColor) {
														setDefaultColorCheck(false);
													} else {
														setDefaultColorCheck(true);
													}
												}}
											/>
										</Box>
									</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					</TableContainer>
					<Button
						variant="contained"
						disabled={isLoading}
						onClick={() => {
							chrome.storage.sync.set({ pointerMode: pointerMode, shapeColor: color });
							const demoWindow = document.querySelector<HTMLIFrameElement>("#demo-window");
							if (demoWindow !== null && demoWindow.contentWindow !== null) {
								demoWindow.contentWindow.location.reload();
							}
						}}
					>
						保存する
					</Button>
				</Box>
			</Box>
			<Box sx={{ width: "100%", height: "100%", overflow: "hidden", borderLeft: "2px solid #E0E0E0" }}>
				<AppBar position="static">
					<Toolbar>
						<Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: "center" }}>
							DEMO
						</Typography>
					</Toolbar>
				</AppBar>
				<Box
					sx={{
						width: "100%",
						height: "100%",
						"& iframe": {
							width: "100%",
							height: "100%",
							border: "none"
						}
					}}
				>
					<iframe id="demo-window" src="/demo.html"></iframe>
				</Box>
			</Box>
		</Box>
	);
}

export default App;
