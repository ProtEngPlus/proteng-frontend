import { Text, View } from "@react-pdf/renderer";
import { ReportStyles as styles } from "../../ReportStyle";
import InfoBox, { renderOptionText } from "../../ReportInfoBox";
import { OptionValue } from "../../../../interfaces/Job.interface";
import { formatRange, formatRegions } from "../../../../utils/mutationRegions";

export default function MutationReport({
  tool,
  option,
  runTime,
}: {
  tool: string;
  option: Record<string, OptionValue>;
  runTime: string;
}) {
  const Mcmc = () => (
    <View>
      <InfoBox
        label={"Number Of Trajectories"}
        text={renderOptionText(option.num_trajectories)}
      />
      <InfoBox
        label={"Number Of Iteration"}
        text={renderOptionText(option.num_iterations)}
      />
      {"mutate_regions" in option && (
        <InfoBox
          label={"Mutation Regions"}
          text={formatRegions(option.mutate_regions)}
        />
      )}
      {"num_mutations_low" in option && (
        <InfoBox
          label={"Number Of Mutations"}
          text={formatRange(
            option.num_mutations_low,
            option.num_mutations_high,
          )}
        />
      )}
      {"amino_acid_set" in option && (
        <InfoBox
          label={"Amino Acids"}
          text={renderOptionText(option.amino_acid_set)}
        />
      )}
      {"mutate_pos_range" in option && (
        <InfoBox
          label={"Mutation Position Range"}
          text={renderOptionText(option.mutate_pos_range)}
        />
      )}
      <InfoBox
        label={"Temperature"}
        text={renderOptionText(option.temperature)}
      />
    </View>
  );

  const ToolSelection = () => {
    switch (tool) {
      case "mutation":
        return <Mcmc />;
      default:
        return <Text>No tool selected.</Text>;
    }
  };

  return (
    <View style={styles.stageInfoBox}>
      <View style={styles.stageTitle}>
        <View style={styles.infoBox}>
          <Text style={styles.stageLabel}>Mutation</Text>
        </View>
        <View style={styles.infoBox}>
          <Text>Run Time:</Text>
          <Text> {runTime || "-"} minute</Text>
        </View>
      </View>
      <View>
        <InfoBox label={"Tool"} text={tool || "-"} />
        <ToolSelection />
      </View>
    </View>
  );
}
